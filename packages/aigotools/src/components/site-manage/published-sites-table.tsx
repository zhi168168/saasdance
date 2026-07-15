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
  Tags,
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
  managerSearchSites,
  repairSiteCategories,
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

type ImportRow = {
  url: string;
  categories: string[];
};

const urlHeaderKeys = new Set([
  "url",
  "urls",
  "link",
  "links",
  "website",
  "websiteurl",
  "site",
  "siteurl",
  "domain",
  "网址",
  "链接",
  "网站",
  "站点",
]);

const categoryHeaderKeys = new Set([
  "category",
  "categories",
  "cat",
  "type",
  "types",
  "attribute",
  "attributes",
  "property",
  "properties",
  "tag",
  "tags",
  "分类",
  "分类名",
  "类别",
  "属性",
  "标签",
]);

function normalizeHeader(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function findHeaderIndex(row: unknown[] = [], keys: Set<string>) {
  return row.findIndex((value) => keys.has(normalizeHeader(value)));
}

function splitCategories(value: unknown) {
  return String(value || "")
    .split(/[,，;；、|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function importRowsFromSheetRows(rows: unknown[][]): ImportRow[] {
  const firstRow = rows[0] || [];
  const headerUrlIndex = findHeaderIndex(firstRow, urlHeaderKeys);
  const headerCategoryIndex = findHeaderIndex(firstRow, categoryHeaderKeys);
  const hasHeader = headerUrlIndex >= 0;
  const urlIndex = hasHeader ? headerUrlIndex : 0;
  const categoryIndex = hasHeader ? headerCategoryIndex : 1;
  const dataRows = hasHeader ? rows.slice(1) : rows;

  return dataRows.map((row) => ({
    url: String(row?.[urlIndex] || "").trim(),
    categories: categoryIndex >= 0 ? splitCategories(row?.[categoryIndex]) : [],
  }));
}

async function parseImportRows(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "xlsx" || extension === "xls" || extension === "csv") {
    const XLSX = await import("xlsx");
    const workbook =
      extension === "csv"
        ? XLSX.read(await file.text(), { type: "string" })
        : XLSX.read(await file.arrayBuffer(), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

    return importRowsFromSheetRows(rows);
  }

  const text = await file.text();
  const rows = text
    .split(/\r?\n/)
    .map((line) => line.split(/\t|,/).map((item) => item.trim()));

  return importRowsFromSheetRows(rows);
}

function cleanImportRows(values: ImportRow[]) {
  const rows = new Map<string, ImportRow>();

  values.forEach((row) => {
    const url = row.url.trim();

    if (!url || urlHeaderKeys.has(normalizeHeader(url))) {
      return;
    }

    const existing = rows.get(url);

    rows.set(url, {
      url,
      categories: Array.from(
        new Set([...(existing?.categories || []), ...row.categories])
      ),
    });
  });

  return Array.from(rows.values());
}

export default function PublishedSitesTable() {
  const t = useTranslations("siteManage");
  const importInputRef = useRef<HTMLInputElement>(null);
  const [site, setSite] = useState<Site | undefined>(undefined);
  const [importing, setImporting] = useState(false);
  const [repairingCategories, setRepairingCategories] = useState(false);
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
        const rows = cleanImportRows(await parseImportRows(file));

        if (!rows.length) {
          toast.error(t("importEmpty"));

          return;
        }

        setImportProgress({ done: 0, total: rows.length });

        let successCount = 0;
        const failedUrls: string[] = [];

        for (const row of rows) {
          try {
            const data = await autoFillTool(row.url);
            const categories = row.categories.length
              ? row.categories
              : data.categories || [data.category];
            const saved = await saveSite(
              createTemplateSite({
                url: data.url,
                name: data.name,
                snapshot: data.appImage,
                desceription: data.tagline,
                metaDesceription: data.tagline,
                pricingType: "Free",
                categories,
                images: data.logo ? [data.logo] : [],
                state: SiteState.published,
                processStage: ProcessStage.success,
              })
            );

            if (saved) {
              successCount += 1;
            } else {
              failedUrls.push(row.url);
            }
          } catch (error) {
            console.log("Import site failed", row.url, error);
            failedUrls.push(row.url);
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

  const handleRepairCategories = useCallback(async () => {
    if (repairingCategories) {
      return;
    }

    if (!window.confirm(t("repairCategoriesConfirm"))) {
      return;
    }

    try {
      setRepairingCategories(true);
      const result = await repairSiteCategories();

      toast.success(
        t("repairCategoriesSuccess", {
          updated: result.updated,
          total: result.total,
        })
      );
      await handleSearch();
    } catch (error) {
      console.log(error);
      toast.error(t("repairCategoriesFailed"));
    } finally {
      setRepairingCategories(false);
    }
  }, [handleSearch, repairingCategories, t]);

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
          <Button
            color="primary"
            isLoading={repairingCategories}
            size="sm"
            startContent={repairingCategories ? null : <Tags size={14} />}
            variant="flat"
            onPress={handleRepairCategories}
          >
            {t("repairCategories")}
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
