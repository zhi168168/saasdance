import { getTranslations } from "next-intl/server";

import Container from "@/components/common/container";
import FeaturedSitesSidebar from "@/components/common/featured-sites-sidebar";
import Hero from "@/components/index/hero";
import LatestSitesFeed from "@/components/index/latest-sites-feed";
import LocalApprovedSites from "@/components/common/local-approved-sites";
import Search from "@/components/index/search";
import { getFeaturedSites, getLatestSitesPage } from "@/lib/actions";

export default async function Page() {
  const t = await getTranslations("index");
  const [featuredSites, latestSitesPage] = await Promise.all([
    getFeaturedSites(6),
    getLatestSitesPage({ page: 1, size: 18 }),
  ]);

  return (
    <>
      <Container className="mt-2 xl:hidden">
        <Search compact className="mx-auto max-w-[420px]" />
      </Container>
      <Container>
        <Hero />
      </Container>
      <Container className="mt-10 sm:mt-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start xl:gap-14">
          <main className="min-w-0">
            <LocalApprovedSites />
            <LatestSitesFeed
              initialHasNext={latestSitesPage.hasNext}
              initialSites={latestSitesPage.sites}
              title={t("latest")}
            />
          </main>
          <FeaturedSitesSidebar sites={featuredSites} title={t("featured")} />
        </div>
      </Container>
    </>
  );
}
