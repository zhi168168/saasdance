import { Site } from "@/models/site";

export function createSiteSlug(name: string) {
  const slug = name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "site";
}

export function createSiteDetailPath(site: Pick<Site, "name">, index = 0) {
  return `/${createSiteSlug(site.name)}${index > 0 ? index : ""}`;
}

export function createUniqueSiteDetailPaths<T extends Pick<Site, "name">>(
  sites: T[],
) {
  const counts = new Map<string, number>();

  return sites.map((site) => {
    const slug = createSiteSlug(site.name);
    const index = counts.get(slug) || 0;

    counts.set(slug, index + 1);

    return createSiteDetailPath(site, index);
  });
}
