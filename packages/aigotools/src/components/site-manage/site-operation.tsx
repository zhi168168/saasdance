import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import {
  Atom,
  Axe,
  BadgeCheck,
  Edit,
  Star,
  StopCircle,
  Trash2,
} from "lucide-react";

import { Site } from "@/models/site";
import { ProcessStage, SiteState } from "@/lib/constants";
import {
  deleteSite,
  dispatchSiteCrawl,
  stopSiteCrawl,
  triggerSitePublish,
  updateSiteFeatured,
  verifySiteBadge,
} from "@/lib/actions";
import OperationIcon from "@/components/common/operation-icon";

export default function SiteOperation({
  site,
  handleSearch,
  onEdit,
}: {
  site: Site;
  handleSearch: () => void;
  onEdit: () => void;
}) {
  const t = useTranslations("siteManage");

  const [operationing, setOperationing] = useState(false);

  const handleToggleFeatured = useCallback(async () => {
    if (operationing) {
      return false;
    }

    try {
      setOperationing(true);
      await updateSiteFeatured(site._id, !site.featured);
      toast.success(
        site.featured ? t("unfeatureSuccess") : t("featureSuccess"),
      );
      handleSearch();
    } catch (error) {
      console.log(error);
      toast.error(t("featureFailed"));
    } finally {
      setOperationing(false);
    }
  }, [handleSearch, operationing, site._id, site.featured, t]);

  const handleUpdateSitePublish = useCallback(
    async (site: Site) => {
      if (operationing) {
        return false;
      }

      try {
        setOperationing(true);

        const updated = await triggerSitePublish(site);

        if (!updated) {
          toast.error(t("failTriggerPublish"));
        }

        handleSearch();
      } catch (error) {
        console.log(error);
        toast.error(t("failTriggerPublish"));
      } finally {
        setOperationing(false);
      }
    },
    [handleSearch, operationing, t],
  );

  const handleVerifyBadge = useCallback(async () => {
    if (operationing) {
      return false;
    }

    try {
      setOperationing(true);
      const verified = await verifySiteBadge(site._id);

      if (verified) {
        toast.success(t("badgeVerified"));
      } else {
        toast.error(t("badgeNotFound"));
      }
      handleSearch();
    } catch (error) {
      console.log(error);
      toast.error(t("badgeVerifyFailed"));
    } finally {
      setOperationing(false);
    }
  }, [handleSearch, operationing, site._id, t]);

  const stopSite = useCallback(
    async (e: any) => {
      if (operationing) {
        return false;
      }
      try {
        setOperationing(true);

        await stopSiteCrawl(site._id);
        await handleSearch();
      } catch (error) {
        console.log(error);
        toast(t("stopFailed"));
      } finally {
        setOperationing(false);
      }
    },
    [handleSearch, operationing, site._id, t],
  );

  const handleDeleteSite = useCallback(
    async (e: any) => {
      if (operationing) {
        return false;
      }
      try {
        setOperationing(true);

        await deleteSite(site._id);
        await handleSearch();
      } catch (error) {
        console.log(error);
        toast(t("deleteFailed"));
      } finally {
        setOperationing(false);
      }
    },
    [handleSearch, operationing, site._id, t],
  );

  const dispatchSite = useCallback(
    async (e: any) => {
      if (operationing) {
        return false;
      }
      try {
        setOperationing(true);
        await dispatchSiteCrawl(site._id);
        await handleSearch();
      } catch (error) {
        console.log(error);
        toast(t("dispatchFailed"));
      } finally {
        setOperationing(false);
      }
    },
    [handleSearch, operationing, site._id, t],
  );

  return (
    <Dropdown
      classNames={{ content: "!min-w-24 bg-primary-100 shadow" }}
      isDisabled={operationing}
    >
      <DropdownTrigger>
        <Button isIconOnly isLoading={operationing} size="sm">
          <OperationIcon className="w-4 h-4" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem
          className={site.badgeVerified ? "text-success-500" : "text-blue-500"}
          startContent={<BadgeCheck size={14} />}
          onClick={handleVerifyBadge}
        >
          {t("verifyBadge")}
        </DropdownItem>
        <DropdownItem
          className={site.featured ? "text-warning-500" : "text-blue-500"}
          startContent={
            <Star fill={site.featured ? "currentColor" : "none"} size={14} />
          }
          onClick={handleToggleFeatured}
        >
          {site.featured ? t("unfeature") : t("feature")}
        </DropdownItem>
        <DropdownItem
          className={
            site.state === SiteState.published
              ? "text-danger-500"
              : "text-success-500"
          }
          startContent={<Axe size={14} />}
          onClick={() => handleUpdateSitePublish(site)}
        >
          {site.state === SiteState.published ? t("unpublish") : t("publish")}
        </DropdownItem>
        {site.processStage !== ProcessStage.processing ? (
          <DropdownItem
            className="text-blue-500"
            startContent={<Atom size={14} />}
            onClick={dispatchSite}
          >
            {t("dispatch")}
          </DropdownItem>
        ) : (
          <DropdownItem
            startContent={<StopCircle size={14} />}
            onClick={stopSite}
          >
            {t("stop")}
          </DropdownItem>
        )}
        <DropdownItem
          className="text-yellow-500"
          startContent={<Edit size={14} />}
          onClick={onEdit}
        >
          {t("edit")}
        </DropdownItem>
        <DropdownItem
          className="text-danger-500/50"
          startContent={<Trash2 size={14} />}
          onClick={handleDeleteSite}
        >
          {t("delete")}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
