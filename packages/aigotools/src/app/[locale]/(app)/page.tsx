import { getTranslations } from "next-intl/server";

import Container from "@/components/common/container";
import FeaturedSitesSidebar from "@/components/common/featured-sites-sidebar";
import Hero from "@/components/index/hero";
import LocalApprovedSites from "@/components/common/local-approved-sites";
import Search from "@/components/index/search";
import SiteGroup from "@/components/common/sites-group";
import { getFeaturedSites, getLatestSites } from "@/lib/actions";

export default async function Page() {
  const t = await getTranslations("index");
  const [featuredSites, latestSites] = await Promise.all([
    getFeaturedSites(),
    getLatestSites(),
  ]);

  return (
    <>
      <Container>
        <Hero />
      </Container>
      <Search />
      <Container className="mt-10 sm:mt-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start xl:gap-14">
          <main className="min-w-0">
            <LocalApprovedSites />
            <SiteGroup
              className="mt-0 sm:mt-0"
              contained={false}
              id="latest"
              sites={latestSites}
              title={t("latest")}
            />
          </main>
          <FeaturedSitesSidebar sites={featuredSites} title={t("featured")} />
        </div>
      </Container>
    </>
  );
}
