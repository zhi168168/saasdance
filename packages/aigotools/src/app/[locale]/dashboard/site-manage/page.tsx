import { useTranslations } from "next-intl";

import DashboardTitle from "@/components/common/dashboard-title";
import LocalAdminPlaceholder from "@/components/common/local-admin-placeholder";
import PublishedSitesTable from "@/components/site-manage/published-sites-table";
import { AppConfig } from "@/lib/config";

export default function SiteManage() {
  const t = useTranslations("siteManage");

  return (
    <div className="p-6 w-full">
      <DashboardTitle title={t("title")} />
      {AppConfig.mongoUri && AppConfig.clerkEnabled ? (
        <PublishedSitesTable />
      ) : (
        <LocalAdminPlaceholder title="Site Manage" />
      )}
    </div>
  );
}
