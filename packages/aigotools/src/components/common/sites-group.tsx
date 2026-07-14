import { Istok_Web } from "next/font/google";
import clsx from "clsx";

import { Site } from "@/models/site";
import Container from "@/components/common/container";
import { createUniqueSiteDetailPaths } from "@/lib/site-slug";

import SiteCard from "./site-card";

const istokWeb = Istok_Web({
  subsets: ["latin"],
  weight: "700",
});

export default function SiteGroup({
  title,
  sites,
  id,
}: {
  id?: string;
  title: String;
  sites: Array<Site>;
}) {
  if (!sites.length) {
    return null;
  }

  const detailPaths = createUniqueSiteDetailPaths(sites);

  return (
    <Container className="mt-10 sm:mt-16" id={id}>
      <h2 className={clsx(istokWeb.className, "text-2xl font-bold")}>
        {title}
      </h2>
      <div className="mt-4 divide-y divide-primary-200/70">
        {sites.map((site, index) => {
          return (
            <SiteCard
              key={site._id}
              detailPath={detailPaths[index]}
              site={site}
            />
          );
        })}
      </div>
    </Container>
  );
}
