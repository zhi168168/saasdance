import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

import Container from "@/components/common/container";
import SiteGroup from "@/components/common/sites-group";
import NavBar from "@/components/common/nav-bar";
import LocalSiteDetail from "@/components/site/local-site-detail";
import SiteDetail from "@/components/site/site-detail";
import { getSiteDetailBySlug, getSiteMetadataBySlug } from "@/lib/actions";

export async function generateMetadata({
  params,
}: {
  params: { site: string; locale: string };
}): Promise<Metadata> {
  const site = await getSiteMetadataBySlug(params.site);

  return {
    title: `${site?.title}`,
    description: site?.description,
    keywords: site?.keywords,
  };
}

export default async function Page({ params }: { params: { site: string } }) {
  const t = await getTranslations("site");
  const site = await getSiteDetailBySlug(params.site);

  if (!site) {
    return (
      <Container className="mt-4">
        <LocalSiteDetail siteKey={params.site} />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <NavBar name={site.site.name} />
      <SiteDetail site={site.site} />
      {site.suggests.length > 0 && (
        <SiteGroup sites={site.suggests} title={t("relatedTools")} />
      )}
    </Container>
  );
}
