import { Site } from "@/models/site";

const cloudinaryImageUploadPattern =
  /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/i;
const cloudinaryRawUploadPattern =
  /^https:\/\/res\.cloudinary\.com\/[^/]+\/raw\/upload\//i;

function getFaviconUrl(site: Site) {
  if (!site.url) {
    return "/icon.png";
  }

  return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(
    site.url,
  )}&sz=64`;
}

function getManagedLogoUrl(value: string) {
  if (value.startsWith("/")) {
    return value;
  }

  if (cloudinaryRawUploadPattern.test(value)) {
    return "";
  }

  const cloudinaryMatch = value.match(cloudinaryImageUploadPattern);

  if (cloudinaryMatch) {
    return `${cloudinaryMatch[1]}f_auto,q_auto,w_96,h_96,c_fit/${cloudinaryMatch[2]}`;
  }

  return "";
}

export function getSiteLogoUrl(site: Site) {
  const uploadedLogo = site.images?.find(Boolean);
  const managedLogo = uploadedLogo ? getManagedLogoUrl(uploadedLogo) : "";

  if (managedLogo) {
    return managedLogo;
  }

  return getFaviconUrl(site);
}
