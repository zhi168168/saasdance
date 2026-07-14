import { Site } from "@/models/site";

export function getSiteLogoUrl(site: Site) {
  const uploadedLogo = site.images?.find(Boolean);

  if (uploadedLogo) {
    return uploadedLogo;
  }

  if (site.url) {
    return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(
      site.url,
    )}&sz=128`;
  }

  return "/icon.png";
}
