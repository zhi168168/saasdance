"use client";

import { Spinner } from "@nextui-org/react";
import { Istok_Web } from "next/font/google";
import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";

import SiteCard from "@/components/common/site-card";
import { getLatestSitesPage } from "@/lib/actions";
import { createUniqueSiteDetailPaths } from "@/lib/site-slug";
import { Site } from "@/models/site";

const istokWeb = Istok_Web({
  subsets: ["latin"],
  weight: "700",
});

export default function LatestSitesFeed({
  initialHasNext,
  initialSites,
  title,
}: {
  initialHasNext: boolean;
  initialSites: Site[];
  title: string;
}) {
  const pageSize = 18;
  const [sites, setSites] = useState(initialSites);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(initialHasNext);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadNextPage = useCallback(async () => {
    if (loading || !hasNext) {
      return;
    }

    try {
      setLoading(true);
      const nextPage = page + 1;
      const result = await getLatestSitesPage({
        page: nextPage,
        size: pageSize,
      });

      setSites((currentSites) => currentSites.concat(result.sites));
      setPage(result.page);
      setHasNext(result.hasNext);
    } finally {
      setLoading(false);
    }
  }, [hasNext, loading, page]);

  useEffect(() => {
    const loader = loaderRef.current;

    if (!loader) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadNextPage();
        }
      },
      {
        rootMargin: "420px 0px",
      },
    );

    observer.observe(loader);

    return () => observer.disconnect();
  }, [loadNextPage]);

  const detailPaths = createUniqueSiteDetailPaths(sites);

  return (
    <section id="latest">
      <div className="mb-4 flex h-8 items-center">
        <h2 className={clsx(istokWeb.className, "text-2xl font-bold")}>
          {title}
        </h2>
      </div>
      <div className="divide-y divide-primary-200/70">
        {sites.map((site, index) => (
          <SiteCard
            key={`${site._id}-${index}`}
            detailPath={detailPaths[index]}
            site={site}
          />
        ))}
      </div>
      <div ref={loaderRef} className="flex h-16 items-center justify-center">
        {loading && <Spinner size="sm" />}
      </div>
    </section>
  );
}
