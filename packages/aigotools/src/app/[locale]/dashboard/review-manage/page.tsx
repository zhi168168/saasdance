import { useTranslations } from "next-intl";

import DashboardTitle from "@/components/common/dashboard-title";
import LocalReviewTable from "@/components/review-manage/local-review-table";
import ReviewTable from "@/components/review-manage/review-table";
import { AppConfig } from "@/lib/config";

export default function ReviewManage() {
  const t = useTranslations("reviewManage");

  return (
    <div className="p-6 w-full">
      <DashboardTitle title={t("title")} />
      {AppConfig.mongoUri && AppConfig.clerkEnabled ? (
        <ReviewTable />
      ) : (
        <LocalReviewTable />
      )}
    </div>
  );
}
