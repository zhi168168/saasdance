"use client";
import clsx from "clsx";
import { Image } from "@nextui-org/react";
import { ExternalLink, Tag, ThumbsUpIcon } from "lucide-react";

import { Site } from "@/models/site";
import { useRouter } from "@/navigation";
import { createSiteDetailPath } from "@/lib/site-slug";
import { getSiteLogoUrl } from "@/lib/site-logo";

export default function SiteCard({
  site,
  detailPath = createSiteDetailPath(site),
}: {
  site: Site;
  detailPath?: string;
}) {
  const router = useRouter();
  const openDetail = () => {
    router.push(detailPath);
  };
  const logoUrl = getSiteLogoUrl(site);

  return (
    <div
      key={site._id as string}
      className="group flex w-full cursor-pointer items-center gap-4 py-5 transition-colors hover:bg-primary-100/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 sm:gap-5 sm:px-2"
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
      <Image
        alt={site.name}
        classNames={{
          wrapper:
            "h-12 w-12 shrink-0 !max-w-none rounded-lg border border-primary-200 bg-white sm:h-14 sm:w-14",
          img: "h-12 w-12 object-contain p-2 sm:h-14 sm:w-14",
        }}
        decoding="async"
        fallbackSrc="/icon.png"
        loading="lazy"
        radius="sm"
        src={logoUrl}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div
            className={clsx(
              "relative flex min-w-0 items-center gap-2 font-semibold text-primary-900",
              "after:content-[' '] after:overflow-hidden after:absolute after:-bottom-[1px] after:left-0 after:h-[2px] after:bg-primary-900 after:w-0 group-hover:after:w-full after:transition-width",
            )}
          >
            <h3 className="truncate text-base">{site.name}</h3>
            <ExternalLink className="shrink-0 opacity-70" size={15} />
          </div>
        </div>
        <div className="mt-1 line-clamp-2 overflow-hidden text-ellipsis text-sm leading-6 text-primary-500 sm:line-clamp-1">
          {site.desceription}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-tiny text-primary-700">
          {site.categories?.slice(0, 3)?.map((category, index) => (
            <span key={index} className="inline-flex items-center gap-1">
              {index === 0 && <Tag className="text-primary-500" size={13} />}
              <span>{category}</span>
              {index < Math.min(site.categories.length, 3) - 1 && (
                <span className="text-primary-300">.</span>
              )}
            </span>
          ))}
          {site.pricingType && (
            <>
              {!!site.categories?.length && (
                <span className="text-primary-300">.</span>
              )}
              <span>{site.pricingType}</span>
            </>
          )}
        </div>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl border border-primary-200 bg-white text-primary-800 shadow-sm">
          <ThumbsUpIcon size={15} />
          <span className="mt-0.5 text-tiny font-semibold leading-none">
            {site.voteCount || 0}
          </span>
        </div>
        <div className="hidden h-12 w-12 flex-col items-center justify-center rounded-xl border border-primary-200 bg-white text-primary-800 shadow-sm sm:flex">
          <ExternalLink size={15} />
          <span className="mt-0.5 text-tiny font-semibold leading-none">-</span>
        </div>
      </div>
    </div>
  );
}
