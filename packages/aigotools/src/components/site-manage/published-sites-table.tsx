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
import { Eye, EyeOff, SearchIcon } from "lucide-react";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import EmptyImage from "@/components/search/empty-image";
import Loading from "@/components/common/loading";
import { managerSearchSites, triggerSitePublish } from "@/lib/actions";
import { SiteState } from "@/lib/constants";
import { Link } from "@/navigation";
import { Site } from "@/models/site";

export default function PublishedSitesTable() {
  const t = useTranslations("siteManage");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState("");
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

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  return (
    <div className="mt-4 relative py-4 text-sm">
      <div className="flex justify-end">
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
            <TableColumn>Image</TableColumn>
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
                  {site.snapshot ? (
                    <img
                      alt={site.name}
                      className="h-12 w-20 rounded-md object-cover"
                      src={site.snapshot}
                    />
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <Link
                    className="font-semibold text-primary-900 hover:underline"
                    href={`/s/${site.siteKey}`}
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
                  <Button
                    color={
                      site.state === SiteState.published ? "danger" : "success"
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
    </div>
  );
}
