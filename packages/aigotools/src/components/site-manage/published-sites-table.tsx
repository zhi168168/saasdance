"use client";

import {
  Button,
  Input,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import dayjs from "dayjs";
import { debounce } from "lodash";
import {
  Eye,
  EyeOff,
  FileUp,
  Plus,
  RefreshCw,
  SearchIcon,
  Star,
} from "lucide-react";
import clsx from "clsx";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import SiteEdit from "./site-edit";

import EmptyImage from "@/components/search/empty-image";
import Loading from "@/components/common/loading";
import {
  autoFillTool,
  managerSearchCategories,
  managerSearchSites,
  saveSite,
  triggerSitePublish,
  updateSiteFeatured,
} from "@/lib/actions";
import { ProcessStage, SiteState } from "@/lib/constants";
import { Link } from "@/navigation";
import { Site } from "@/models/site";
import { createSiteDetailPath } from "@/lib/site-slug";
import { createTemplateSite } from "@/lib/create-template-site";
import { getSiteLogoUrl } from "@/lib/site-logo";

async function parseImportUrls(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "xlsx" || extension === "xls") {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

    return rows.map((row) => row?.[0]);
  }

  const text = await file.text();

  return text.split(/\r?\n/).map((line) => line.split(",")[0]);
}

function cleanImportUrls(values: unknown[]) {
  return Array.from(
    new Set(
      values
        .map((value) => String(value || "").trim())
        .filter(Boolean)
        .filter((value) => !/^url$/i.test(value))
    )
  );
}

export default function PublishedSitesTable() {
  const t = useTranslations("siteManage");
  const importInputRef = useRef<HTMLInputElement>(null);
  const [site, setSite] = useState<Site | undefined>(undefined);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({
    done: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState("");
  const [refetchingImage, setRefetchingImage] = useState("");
  const [searchParams, setSearchParams] = useState({
    page: 1,
    size: 15,
    search: "",
  });
  const [result, setResult] = useState({
    sites: [] as Site[],
    count: 0,
    totalPage: 0,
  });

  const handleSearch = useCallback(async () => {
    try {
      setLoading(true);
      const nextResult = await managerSearchSites(searchParams);

      setResult(nextResult);
    } catch (error) {
      console.log(error);
      toast.error(t("failSearch"));
    } finally {
      setLoading(false);
    }
  }, [searchParams, t]);

  const handleTogglePublish = useCallback(
    async (site: Site) => {
      if (updating) {
        return;
      }

      try {
        setUpdating(site._id);

        const updated = await triggerSitePublish(site);

        if (!updated) {
          toast.error(t("failTriggerPublish"));
        }

        await handleSearch();
      } catch (error) {
        console.log(error);
        toast.error(t("failTriggerPublish"));
      } finally {
        setUpdating("");
      }
    },
    [handleSearch, t, updating]
  );

  const handleToggleFeatured = useCallback(
    async (site: Site) => {
      if (updating) {
        return;
      }

      try {
        setUpdating(site._id);
        await updateSiteFeatured(site._id, !site.featured);
        toast.success(
          site.featured ? t("unfeatureSuccess") : t("featureSuccess")
        );
        await handleSearch();
      } catch (error) {
        console.log(error);
        toast.error(t("featureFailed"));
      } finally {
        setUpdating("");
      }
    },
    [handleSearch, t, updating]
  );

  const handleImportSites = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      event.target.value = "";

      if (!file || importing) {
        return;
      }

      try {
        setImporting(true);
        setImportProgress({ done: 0, total: 0 });
        const urls = cleanImportUrls(await parseImportUrls(file));

        if (!urls.length) {
          toast.error(t("importEmpty"));

          return;
        }

        setImportProgress({ done: 0, total: urls.length });

        const categoryResult = await managerSearchCategories({
          page: 1,
          size: 999,
          type: "second",
        });
        let successCount = 0;
        const failedUrls: string[] = [];

        for (const url of urls) {
          try {
            const data = await autoFillTool(url);
            const category = categoryResult.categories.find(
              (item) => item.name === data.category
            );
            const saved = await saveSite(
              createTemplateSite({
                url: data.url,
                name: data.name,
                snapshot: data.appImage,
                desceription: data.tagline,
                metaDesceription: data.tagline,
                pricingType: "Free",
                categories: category ? [category._id] : [],
                images: data.logo ? [data.logo] : [],
                state: SiteState.published,
                processStage: ProcessStage.success,
              })
            );

            if (saved) {
              successCount += 1;
            } else {
              failedUrls.push(url);
            }
          } catch (error) {
            console.log("Import site failed", url, error);
            failedUrls.push(url);
          } finally {
            setImportProgress((progress) => ({
              ...progress,
              done: progress.done + 1,
            }));
          }
        }

        if (successCount) {
          toast.success(
            t("importSuccess", {
              success: successCount,
              failed: failedUrls.length,
            })
          );
        }

        if (failedUrls.length) {
          toast.error(t("importFailed", { count: failedUrls.length }));
          console.log("Failed imported urls", failedUrls);
        }

        await handleSearch();
      } catch (error) {
        console.log(error);
        toast.error(t("importFailed", { count: 0 }));
      } finally {
        setImporting(false);
      }
    },
    [handleSearch, importing, t]
  );

  const handleRefetchImage = useCallback(
    async (site: Site) => {
      if (refetchingImage) {
        return;
      }

      try {
        setRefetchingImage(site._id);
        const data = await autoFillTool(site.url);
        const saved = await saveSite({
          ...site,
          name: data.name,
          snapshot: data.appImage,
          desceription: data.tagline,
          metaDesceription: data.tagline,
          images: data.logo ? [data.logo] : site.images || [],
          updatedAt: Date.now(),
        });

        if (!saved) {
          toast.error(t("refetchImageFailed"));

          return;
        }

        toast.success(t("rowAutoFillSuccess"));
        await handleSearch();
      } catch (error) {
        console.log(error);
        toast.error(t("rowAutoFillFailed"));
      } finally {
        setRefetchingImage("");
      }
    },
    [handleSearch, refetchingImage, t]
  );

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  return (
    <div className="mt-4 relative py-4 text-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            color="primary"
            size="sm"
            startContent={<Plus size={14} />}
            onPress={() => setSite(createTemplateSite())}
          >
            {t("new")}
          </Button>
          <Button
            color="primary"
            isLoading={importing}
            size="sm"
            startContent={importing ? null : <FileUp size={14} />}
            variant="flat"
            onPress={() => importInputRef.current?.click()}
          >
            {t("importSheet")}
          </Button>
          <input
            ref={importInputRef}
            accept=".xlsx,.xls,.csv,.txt"
            className="hidden"
            type="file"
            onChange={handleImportSites}
          />
          {importing && importProgress.total > 0 && (
            <span className="text-sm font-medium text-primary-500">
              {t("importProgress", {
                done: importProgress.done,
                total: importProgress.total,
              })}
            </span>
          )}
        </div>
        <Input
          className="w-80"
          endContent={
            <SearchIcon
              className="cursor-pointer"
              size={14}
              strokeWidth={3}
              onClick={() => handleSearch()}
            />
          }
          placeholder={t("inputSearch")}
          size="sm"
          onChange={debounce(
            (event) =>
              setSearchParams({
                ...searchParams,
                search: event.target.value,
                page: 1,
              }),
            800,
            { maxWait: 3000 }
          )}
        />
      </div>

      <div className="mt-6 relative">
        <Table
          className="mt-6"
          classNames={{
            th: "text-xs",
            td: "text-sm py-2",
          }}
          shadow="sm"
        >
          <TableHeader>
            <TableColumn>Logo</TableColumn>
            <TableColumn>{t("siteName")}</TableColumn>
            <TableColumn>{t("url")}</TableColumn>
            <TableColumn>{t("badge")}</TableColumn>
            <TableColumn>{t("state")}</TableColumn>
            <TableColumn>{t("updatedAt")}</TableColumn>
            <TableColumn>{t("operation")}</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent={
              <div className="w-full flex py-40 items-center justify-center">
                <EmptyImage className="dark:invert" />
              </div>
            }
          >
            {result.sites.map((site) => (
              <TableRow key={site._id}>
                <TableCell>
                  <img
                    alt={`${site.name} logo`}
                    className="h-12 w-12 rounded-md border border-primary-200 bg-white object-contain p-2"
                    src={getSiteLogoUrl(site)}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    className="font-semibold text-primary-900 hover:underline"
                    href={createSiteDetailPath(site)}
                    target="_blank"
                  >
                    {site.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    className="text-blue-500 hover:underline"
                    href={site.url}
                    target="_blank"
                  >
                    {site.url}
                  </Link>
                </TableCell>
                <TableCell>
                  <span
                    className={clsx(
                      "inline-block rounded w-[82px] h-6 leading-6 text-center text-tiny capitalize bg-primary-500 text-white opacity-80",
                      {
                        "bg-green-600 opacity-100": site.badgeVerified,
                      }
                    )}
                  >
                    {site.badgeVerified ? t("verified") : t("unverified")}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="rounded-md bg-primary-100 px-2 py-1 text-xs font-semibold capitalize text-primary-700">
                    {t(site.state)}
                  </span>
                </TableCell>
                <TableCell>
                  {dayjs(site.updatedAt).format("YYYY-MM-DD HH:mm:ss")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      color="primary"
                      isLoading={refetchingImage === site._id}
                      size="sm"
                      startContent={
                        refetchingImage === site._id ? null : (
                          <RefreshCw size={14} />
                        )
                      }
                      variant="flat"
                      onPress={() => handleRefetchImage(site)}
                    >
                      {t("rowAutoFill")}
                    </Button>
                    <Button
                      color={site.featured ? "warning" : "primary"}
                      isLoading={updating === site._id}
                      size="sm"
                      startContent={
                        updating === site._id ? null : (
                          <Star
                            fill={site.featured ? "currentColor" : "none"}
                            size={14}
                          />
                        )
                      }
                      variant="flat"
                      onPress={() => handleToggleFeatured(site)}
                    >
                      {site.featured ? t("unfeature") : t("feature")}
                    </Button>
                    <Button
                      color={
                        site.state === SiteState.published
                          ? "danger"
                          : "success"
                      }
                      isLoading={updating === site._id}
                      size="sm"
                      startContent={
                        updating === site._id ? null : site.state ===
                          SiteState.published ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )
                      }
                      variant="flat"
                      onPress={() => handleTogglePublish(site)}
                    >
                      {site.state === SiteState.published
                        ? t("unpublish")
                        : t("publish")}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Loading isLoading={loading} />
      </div>

      <div className="flex items-center justify-between mt-4 px-4 gap-4">
        <div className="text-primary-400 text-sm flex-grow-0 flex-shrink-0 basis-48">
          Total {result.count}
        </div>
        <div className="pr-48 flex-1 flex items-center justify-center">
          {result.totalPage > 0 && (
            <Pagination
              showControls
              showShadow
              isDisabled={loading}
              page={searchParams.page}
              size="md"
              total={result.totalPage}
              onChange={(page) => {
                setSearchParams({
                  ...searchParams,
                  page,
                });
              }}
            />
          )}
        </div>
      </div>
      <SiteEdit
        site={site}
        onClose={() => {
          setSite(undefined);
          handleSearch();
        }}
      />
    </div>
  );
}
