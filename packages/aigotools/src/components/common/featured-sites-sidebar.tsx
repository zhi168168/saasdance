"use client";
import { Image } from "@nextui-org/react";
import { ExternalLink, Sparkles, ThumbsUpIcon } from "lucide-react";

import { Site } from "@/models/site";
import { useRouter } from "@/navigation";
import { createUniqueSiteDetailPaths } from "@/lib/site-slug";
import { getSiteLogoUrl } from "@/lib/site-logo";

export default function FeaturedSitesSidebar({
  sites,
  title,
}: {
  sites: Site[];
  title: string;
}) {
  const router = useRouter();

  if (!sites.length) {
    return null;
  }

  const detailPaths = createUniqueSiteDetailPaths(sites);

  return (
    <aside className="hidden self-start lg:sticky lg:top-24 lg:block">
      <div>
        <div className="mb-4 flex h-8 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-primary-200 bg-white text-primary-800 shadow-sm">
            <Sparkles size={16} />
          </span>
          <h2 className="text-2xl font-bold text-primary-900">{title}</h2>
        </div>
        <div className="space-y-3">
          {sites.slice(0, 6).map((site, index) => {
            const openDetail = () => router.push(detailPaths[index]);

            return (
              <div
                key={site._id}
                className="group cursor-pointer rounded-lg border border-primary-200 bg-white p-4 shadow-sm transition-all hover:border-primary-300 hover:shadow-medium"
                role="link"
                tabIndex={0}
                onClick={openDetail}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openDetail();
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <Image
                    alt={site.name}
                    classNames={{
                      wrapper:
                        "h-11 w-11 shrink-0 !max-w-none rounded-lg border border-primary-200 bg-white",
                      img: "h-11 w-11 object-contain p-2",
                    }}
                    radius="sm"
                    src={getSiteLogoUrl(site)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 font-semibold text-primary-900">
                      <span className="truncate">{site.name}</span>
                      <ExternalLink
                        className="shrink-0 text-primary-400 transition-colors group-hover:text-primary-700"
                        size={14}
                      />
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-primary-500">
                      {site.desceription}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-tiny text-primary-600">
                  <div className="flex min-w-0 items-center gap-1.5">
                    {site.categories?.[0] && (
                      <span className="truncate">{site.categories[0]}</span>
                    )}
                    {site.categories?.[0] && site.pricingType && (
                      <span className="text-primary-300">.</span>
                    )}
                    {site.pricingType && <span>{site.pricingType}</span>}
                  </div>
                  <div className="flex shrink-0 items-center gap-1 rounded-md border border-primary-200 px-2 py-1 text-primary-800">
                    <ThumbsUpIcon size={13} />
                    <span className="font-semibold">{site.voteCount || 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
