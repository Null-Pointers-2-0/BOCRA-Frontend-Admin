"use client";

import { useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import type { Layer, PathOptions } from "leaflet";
import "leaflet/dist/leaflet.css";

type CoverageMapProps = {
  districtGeoJSON: GeoJSON.FeatureCollection | null;
  coverageGeoJSON: GeoJSON.FeatureCollection | null;
  showDistricts: boolean;
  showCoverage: boolean;
  showHeatMap: boolean;
  selectedOperator: string;
  operatorColors: Record<string, string>;
  getCoverageLevelColor: (level: string) => string;
  onDistrictClick: (districtId: string) => void;
};

// Botswana center and bounds
const BOTSWANA_CENTER: [number, number] = [-22.3285, 24.6849];
const BOTSWANA_ZOOM = 6;

// Heat map gradient: 0% = red, 50% = yellow, 100% = green
function heatMapColor(percentage: number): string {
  const p = Math.max(0, Math.min(100, percentage));
  if (p <= 50) {
    // Red to Yellow
    const ratio = p / 50;
    const r = 239;
    const g = Math.round(68 + ratio * (163 - 68));
    const b = Math.round(68 - ratio * 68);
    return `rgb(${r}, ${g}, ${b})`;
  }
  // Yellow to Green
  const ratio = (p - 50) / 50;
  const r = Math.round(239 - ratio * (239 - 22));
  const g = Math.round(163 + ratio * (163 - 163));
  const b = Math.round(0 + ratio * 106);
  return `rgb(${r}, ${g}, ${b})`;
}

// Invalidate map size when container becomes visible
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function CoverageMap({
  districtGeoJSON,
  coverageGeoJSON,
  showDistricts,
  showCoverage,
  showHeatMap,
  selectedOperator,
  operatorColors,
  getCoverageLevelColor,
  onDistrictClick,
}: CoverageMapProps) {
  // Keys to force re-render of GeoJSON layers when data/mode changes
  const districtKey = useMemo(
    () => `districts-${showDistricts}-${showHeatMap}-${JSON.stringify(coverageGeoJSON?.features?.length)}`,
    [showDistricts, showHeatMap, coverageGeoJSON]
  );
  const coverageKey = useMemo(
    () =>
      `coverage-${showCoverage}-${showHeatMap}-${selectedOperator}-${coverageGeoJSON?.features?.length}`,
    [showCoverage, showHeatMap, selectedOperator, coverageGeoJSON]
  );

  // Compute average coverage per district for heat map mode
  const districtCoverageMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!coverageGeoJSON) return map;
    const byDistrict = new Map<string, number[]>();
    for (const f of coverageGeoJSON.features) {
      const props = f.properties as {
        district_code?: string;
        coverage_percentage?: number;
      };
      if (!props?.district_code) continue;
      const arr = byDistrict.get(props.district_code) || [];
      arr.push(props.coverage_percentage || 0);
      byDistrict.set(props.district_code, arr);
    }
    for (const [code, values] of byDistrict) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      map.set(code, avg);
    }
    return map;
  }, [coverageGeoJSON]);

  // District style
  const districtStyle = useMemo(
    () =>
      (feature: GeoJSON.Feature | undefined): PathOptions => {
        if (!feature) return {};
        const code = (feature.properties as { code?: string })?.code || "";

        if (showHeatMap && districtCoverageMap.size > 0) {
          const avg = districtCoverageMap.get(code) ?? 0;
          return {
            fillColor: heatMapColor(avg),
            fillOpacity: 0.65,
            weight: 2,
            color: "#ffffff",
            opacity: 0.8,
          };
        }

        return {
          fillColor: "#e2e8f0",
          fillOpacity: 0.15,
          weight: 1.5,
          color: "#94a3b8",
          opacity: 0.7,
        };
      },
    [showHeatMap, districtCoverageMap]
  );

  // Coverage overlay style
  const coverageStyle = useMemo(
    () =>
      (feature: GeoJSON.Feature | undefined): PathOptions => {
        if (!feature) return {};
        const props = feature.properties as {
          coverage_level?: string;
          coverage_percentage?: number;
          operator?: string;
        };

        if (showHeatMap) {
          return {
            fillColor: heatMapColor(props?.coverage_percentage || 0),
            fillOpacity: 0.5,
            weight: 1,
            color: "#ffffff",
            opacity: 0.3,
          };
        }

        const opColor =
          operatorColors[(props?.operator as string) || ""] || "#6b7280";
        return {
          fillColor: selectedOperator
            ? getCoverageLevelColor(props?.coverage_level || "NONE")
            : opColor,
          fillOpacity: 0.4,
          weight: 1,
          color: selectedOperator
            ? getCoverageLevelColor(props?.coverage_level || "NONE")
            : opColor,
          opacity: 0.6,
        };
      },
    [
      showHeatMap,
      selectedOperator,
      operatorColors,
      getCoverageLevelColor,
    ]
  );

  // District popup/click handler
  const onEachDistrict = useMemo(
    () => (feature: GeoJSON.Feature, layer: Layer) => {
      const props = feature.properties as {
        id?: string;
        name?: string;
        code?: string;
        population?: number;
      };

      const avgCoverage = districtCoverageMap.get(props?.code || "");
      const coverageText =
        avgCoverage !== undefined
          ? `<br/>Avg Coverage: <strong>${avgCoverage.toFixed(1)}%</strong>`
          : "";

      layer.bindTooltip(
        `<div class="text-xs">
          <strong>${props?.name || "Unknown"}</strong> (${props?.code || ""})
          <br/>Pop: ${(props?.population || 0).toLocaleString()}
          ${coverageText}
        </div>`,
        { sticky: true, className: "leaflet-tooltip-custom" }
      );

      layer.on("click", () => {
        if (props?.id) onDistrictClick(props.id);
      });
    },
    [districtCoverageMap, onDistrictClick]
  );

  // Coverage feature popup
  const onEachCoverage = useMemo(
    () => (feature: GeoJSON.Feature, layer: Layer) => {
      const props = feature.properties as {
        operator_name?: string;
        operator?: string;
        technology?: string;
        coverage_percentage?: number;
        coverage_level?: string;
        district?: string;
        population_covered?: number;
      };

      layer.bindTooltip(
        `<div class="text-xs">
          <strong>${props?.operator_name || ""}</strong> - ${props?.technology || ""}
          <br/>${props?.district || ""}
          <br/>Coverage: <strong>${props?.coverage_percentage || 0}%</strong> (${props?.coverage_level || ""})
          <br/>Pop covered: ${(props?.population_covered || 0).toLocaleString()}
        </div>`,
        { sticky: true, className: "leaflet-tooltip-custom" }
      );
    },
    []
  );

  return (
    <MapContainer
      center={BOTSWANA_CENTER}
      zoom={BOTSWANA_ZOOM}
      className="h-full w-full z-0"
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <MapResizer />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* District boundaries layer */}
      {showDistricts && districtGeoJSON && (
        <GeoJSON
          key={districtKey}
          data={districtGeoJSON}
          style={districtStyle}
          onEachFeature={onEachDistrict}
        />
      )}

      {/* Coverage overlay layer */}
      {showCoverage && !showHeatMap && coverageGeoJSON && (
        <GeoJSON
          key={coverageKey}
          data={coverageGeoJSON}
          style={coverageStyle}
          onEachFeature={onEachCoverage}
        />
      )}
    </MapContainer>
  );
}
