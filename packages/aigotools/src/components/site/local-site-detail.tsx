"use client";

import { Button, Chip, Image } from "@nextui-org/react";
import { ExternalLink, Navigation } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { SiteState } from "@/lib/constants";
import { Site } from "@/models/site";

const localSitesKey = "saasDanceLocalSites";

function getLocalSites(): Site[] {
  try {
    return JSON.parse(window.localStorage.getItem(localSitesKey) || "[]");
  } catch {
    return [];
  }
}

export default function LocalSiteDetail({ siteKey }: { siteKey: string }) {
  const [site, setSite] = useState<Site | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSite(
      getLocalSites().find(
        (item) => item.siteKey === siteKey && item.state === SiteState.published
      ) || null
    );
    setLoaded(true);
  }, [siteKey]);

  if (!loaded) {
    return null;
  }

  if (!site) {
    return (
      <div className="py-24 text-center text-primary-400">
        This tool was not found or has not been approved yet.
      </div>
    );
  }

  return (
    <div className="py-8">
      <Link
        className="flex items-center justify-center gap-2 text-center text-3xl font-bold text-primary-900 hover:underline"
        href={site.url}
        target="_blank"
      >
        {site.name}
        <ExternalLink size={22} />
      </Link>

      <div className="mt-8 grid gap-6 lg:grid-cols-[420px_1fr]">
        <div>
          {site.snapshot && (
            <Image
              isZoomed
              alt={site.name}
              classNames={{
                wrapper: "w-full !max-w-full",
                img: "w-full aspect-video object-cover",
              }}
              radius="sm"
              src={site.snapshot}
            />
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {site.categories.map((category) => (
              <Chip key={category} size="sm" variant="flat">
                {category}
              </Chip>
            ))}
            <Chip size="sm" variant="flat">
              {site.pricingType}
            </Chip>
          </div>
        </div>

        <div className="text-primary-700">
          {site.images?.[0] && (
            <img
              alt={`${site.name} logo`}
              className="mb-5 h-16 w-16 rounded-xl object-contain"
              src={site.images[0]}
            />
          )}
          <p className="text-lg leading-8">{site.desceription}</p>
          <Link href={site.url} target="_blank">
            <Button className="mt-8 font-bold" color="primary" variant="bordered">
              <Navigation size={16} />
              Visit Site
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
