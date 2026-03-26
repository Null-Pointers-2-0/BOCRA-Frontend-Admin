"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { QoEHeatmapDistrict } from "@/lib/api/types";

type QoEHeatmapProps = {
  districts: QoEHeatmapDistrict[];
};

const BOTSWANA_CENTER: [number, number] = [-22.3285, 24.6849];
const BOTSWANA_ZOOM = 6;

function ratingToColor(rating: number): string {
  if (rating >= 4) return "#16a34a";
  if (rating >= 3) return "#f59e0b";
  if (rating >= 2) return "#ef4444";
  return "#991b1b";
}

function radiusFromCount(count: number, maxCount: number): number {
  const min = 8;
  const max = 30;
  if (maxCount <= 0) return min;
  return min + ((count / maxCount) * (max - min));
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function QoEHeatmap({ districts }: QoEHeatmapProps) {
  const maxCount = Math.max(1, ...districts.map((d) => d.report_count));

  return (
    <MapContainer
      center={BOTSWANA_CENTER}
      zoom={BOTSWANA_ZOOM}
      className="h-full w-full"
      scrollWheelZoom
      zoomControl
    >
      <MapResizer />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {districts.map((d) => (
        <CircleMarker
          key={d.district_id}
          center={[d.center_lat, d.center_lng]}
          radius={radiusFromCount(d.report_count, maxCount)}
          pathOptions={{
            color: ratingToColor(d.avg_rating),
            fillColor: ratingToColor(d.avg_rating),
            fillOpacity: 0.6,
            weight: 2,
          }}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
            <div className="text-xs min-w-[160px]">
              <p className="font-semibold text-gray-900 mb-1">
                {d.district_name}
              </p>
              <div className="space-y-0.5 text-gray-600">
                <p>Reports: <strong>{d.report_count}</strong></p>
                <p>Avg Rating: <strong>{d.avg_rating.toFixed(1)}</strong> / 5</p>
                <p>Download: <strong>{d.avg_download_mbps.toFixed(1)}</strong> Mbps</p>
                <p>Upload: <strong>{d.avg_upload_mbps.toFixed(1)}</strong> Mbps</p>
                <p>Latency: <strong>{d.avg_latency_ms.toFixed(0)}</strong> ms</p>
              </div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
