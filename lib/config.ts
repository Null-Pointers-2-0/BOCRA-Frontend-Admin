export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL!,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || "BOCRA Admin",
} as const;
