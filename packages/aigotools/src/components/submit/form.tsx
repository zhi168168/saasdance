"use client";
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import { Check, Copy, Globe2, Upload, WandSparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";

import { autoFillTool, submitReview } from "@/lib/actions";
import { uploadFormDataToCloudinary } from "@/lib/cloudinary";
import { ReviewState, SiteState, ProcessStage } from "@/lib/constants";

const categories = [
  "Artificial Intelligence",
  "Productivity",
  "Marketing",
  "SEO",
  "Directories",
  "Automation",
  "Boilerplates",
  "Developer Tools",
  "Writing",
  "Design",
  "Games",
  "No Code",
  "Community",
  "Education",
  "Email Marketing",
  "Analytics",
];

const localReviewsKey = "saasDanceLocalReviews";
const localSitesKey = "saasDanceLocalSites";

function normalizeWebsiteUrl(value: string) {
  const trimmed = value.trim();

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function getLocalItems<T>(key: string): T[] {
  try {
    return JSON.parse(window.localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function saveLocalItems<T>(key: string, items: T[]) {
  window.localStorage.setItem(key, JSON.stringify(items));
}

function UploadBox({
  label,
  helper,
  required,
  fileName,
  onChange,
}: {
  label: string;
  helper?: string;
  required?: boolean;
  fileName?: string;
  onChange: (fileName: string) => void;
}) {
  const isImageUrl = /^(https?:\/\/|\/)/i.test(fileName || "");
  const [uploading, setUploading] = useState(false);

  return (
    <label className="block">
      <span className="text-sm font-medium text-primary-600">
        {label} {required && <span className="text-danger">*</span>}
        {helper && <span className="text-primary-400"> {helper}</span>}
      </span>
      <span className="mt-2 flex h-20 cursor-pointer items-center justify-center rounded-md border border-dashed border-primary-200 bg-background hover:bg-primary-50">
        <input
          accept="image/*"
          className="sr-only"
          type="file"
          disabled={uploading}
          onChange={async (event) => {
            const file = event.target.files?.[0];

            if (!file) {
              return;
            }
            if (file.size > 5 * 1024 * 1024) {
              toast.error("Image must be smaller than 5MB");
              event.target.value = "";
              return;
            }
            try {
              setUploading(true);
              const formData = new FormData();

              formData.append("files", file);
              const [url] = await uploadFormDataToCloudinary(formData);

              onChange(url);
            } catch {
              toast.error("Image upload failed");
            } finally {
              setUploading(false);
              event.target.value = "";
            }
          }}
        />
        <span className="flex h-full w-full flex-col items-center justify-center gap-1 overflow-hidden px-3 text-sm text-primary-400">
          {uploading ? (
            <span>Uploading...</span>
          ) : isImageUrl ? (
            <img
              alt={label}
              className="max-h-12 max-w-full object-contain"
              src={fileName}
            />
          ) : (
            <Upload size={17} />
          )}
          {fileName ? (
            <span className="max-w-full truncate">{fileName}</span>
          ) : (
            <span>Upload</span>
          )}
        </span>
      </span>
    </label>
  );
}

export default function Form() {
  const t = useTranslations("submit");
  const badgeBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ||
    "https://saasdance.com";
  const badgeHtml = `<a href="${badgeBaseUrl}" target="_blank"><img src="${badgeBaseUrl}/badge/badge_light.png" alt="Featured on SaaSDance" width="200" height="54" /></a>`;

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState("");
  const [logo, setLogo] = useState("");
  const [appImage, setAppImage] = useState("");

  const [submiting, setSubmiting] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);

  const handleCopyBadge = async () => {
    try {
      await navigator.clipboard.writeText(badgeHtml);
      setCopiedBadge(true);
      toast.success("Badge code copied");
      window.setTimeout(() => setCopiedBadge(false), 1800);
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleAutoFill = async () => {
    if (!url) {
      toast.error(t("requireUrl"));
      return;
    }

    try {
      setAutoFilling(true);
      const data = await autoFillTool(url);

      setName(data.name);
      setUrl(data.url);
      setTagline(data.tagline);
      setCategory(data.category);
      setLogo(data.logo);
      setAppImage(data.appImage);
      toast.success(t("autoFillSuccess"));
    } catch {
      toast.error(t("autoFillFailed"));
    } finally {
      setAutoFilling(false);
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name) {
      toast.error(t("requireName"));

      return;
    } else if (!url) {
      toast.error(t("requireUrl"));

      return;
    } else if (!tagline) {
      toast.error(t("requireTagline"));

      return;
    } else if (!category) {
      toast.error(t("requireCategory"));

      return;
    } else if (!logo) {
      toast.error(t("requireLogo"));

      return;
    }
    try {
      if (submiting) {
        return;
      }
      setSubmiting(true);
      const websiteUrl = normalizeWebsiteUrl(url);
      const submited = await submitReview({
        name,
        url: websiteUrl,
        tagline,
        category,
        logo,
        appImage,
      });

      if (submited) {
        const now = Date.now();
        const siteKey = new URL(websiteUrl).hostname.replace(/[^\w]/g, "_");
        const review = {
          _id: `local-review-${now}`,
          name,
          url: websiteUrl,
          tagline,
          category,
          logo,
          appImage,
          userId: "local-user",
          userEmail: "local@saasdance.dev",
          state: ReviewState.pending,
          createdAt: now,
          updatedAt: now,
        };
        const site = {
          _id: `local-site-${now}`,
          userId: "local-user",
          url: websiteUrl,
          siteKey,
          featured: false,
          weight: 0,
          name,
          snapshot: appImage,
          desceription: tagline,
          pricingType: "Free",
          categories: [category],
          images: logo ? [logo] : [],
          features: [],
          usecases: [],
          users: [],
          relatedSearchs: [],
          pricings: [],
          links: {},
          voteCount: 0,
          metaKeywords: [],
          metaDesceription: tagline,
          searchSuggestWords: [],
          badgeVerified: false,
          badgeVerifiedAt: 0,
          state: SiteState.unpublished,
          processStage: ProcessStage.success,
          createdAt: now,
          updatedAt: now,
        };

        saveLocalItems(localReviewsKey, [review, ...getLocalItems(localReviewsKey)]);
        saveLocalItems(localSitesKey, [site, ...getLocalItems(localSitesKey)]);
        toast.success(t("successSubmit"));
        setName("");
        setUrl("");
        setTagline("");
        setCategory("");
        setLogo("");
        setAppImage("");
      } else {
        toast.error(t("failSubmit"));
      }
    } finally {
      setSubmiting(false);
    }
  };

  return (
    <form
      className="mx-auto my-8 flex max-w-[812px] flex-col gap-4"
      onSubmit={onSubmit}
    >
      <div className="rounded-lg border border-primary-200 bg-background p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            isRequired
            className="flex-1"
            label={t("websiteUrl")}
            placeholder={t("websiteUrlPlaceholder")}
            startContent={<Globe2 className="text-primary-400" size={17} />}
            value={url}
            variant="bordered"
            onValueChange={setUrl}
          />
          <Button
            className="font-bold sm:h-14"
            color="danger"
            isLoading={autoFilling}
            size="lg"
            type="button"
            onPress={handleAutoFill}
          >
            <WandSparkles size={17} strokeWidth={3} />
            {t("autoFill")}
          </Button>
        </div>
        <Input
          isRequired
          className="mt-3"
          label={t("toolName")}
          placeholder={t("toolNamePlaceholder")}
          value={name}
          variant="bordered"
          onValueChange={setName}
        />
        <Input
          isRequired
          className="mt-3"
          label={t("tagline")}
          placeholder={t("taglinePlaceholder")}
          value={tagline}
          variant="bordered"
          onValueChange={setTagline}
        />
        <Select
          isRequired
          className="mt-3"
          label={t("category")}
          placeholder={t("categoryPlaceholder")}
          selectedKeys={category ? [category] : []}
          variant="bordered"
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0];

            setCategory(selected ? String(selected) : "");
          }}
        >
          {categories.map((item) => (
            <SelectItem key={item}>{item}</SelectItem>
          ))}
        </Select>
      </div>

      <div className="rounded-lg border border-primary-200 bg-background p-3 sm:p-4">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-medium text-primary-600">
            Add this badge to your homepage footer before review.
          </div>
          <img
            alt="Featured on SaaSDance"
            className="h-[54px] w-[200px] object-contain"
            src={`${badgeBaseUrl}/badge/badge_light.png`}
          />
        </div>
        <div className="flex gap-2 rounded-md border border-primary-200 bg-primary-50 p-2">
          <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap px-2 py-2 text-xs text-primary-900">
            {badgeHtml}
          </code>
          <Button
            isIconOnly
            aria-label="Copy badge code"
            className="shrink-0"
            size="sm"
            type="button"
            variant="flat"
            onPress={handleCopyBadge}
          >
            {copiedBadge ? <Check size={15} /> : <Copy size={15} />}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-primary-200 bg-background p-3 sm:p-4">
        <div className="mb-3 text-sm text-primary-400">
          {t("imageHint")}
        </div>
        <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
          <UploadBox
            required
            fileName={logo}
            label={t("logo")}
            onChange={setLogo}
          />
          <UploadBox
            fileName={appImage}
            helper={t("optional")}
            label={t("appImage")}
            onChange={setAppImage}
          />
        </div>
      </div>
      <Button
        className="font-bold"
        color="primary"
        isLoading={submiting}
        size="lg"
        type="submit"
      >
        {t("submit")}
      </Button>
    </form>
  );
}
