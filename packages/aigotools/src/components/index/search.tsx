"use client";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
} from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import { History, SearchIcon, Trash2 } from "lucide-react";
import clsx from "clsx";
import { useTranslations } from "next-intl";

import { useRouter } from "@/navigation";
import Container from "@/components/common/container";

export default function Search({
  defaultSearch,
  category,
  className,
  compact = false,
}: {
  defaultSearch?: string;
  category?: string;
  className?: string;
  compact?: boolean;
}) {
  const [value, setValue] = useState(defaultSearch || "");

  const router = useRouter();

  const t = useTranslations("index");

  const [histories, setHistories] = useState([] as string[]);

  const loadHistories = useCallback(() => {
    try {
      setHistories(JSON.parse(window.localStorage.getItem("histories") || ""));
    } catch {}
  }, []);

  const saveHistories = useCallback(
    (newRecord: string) => {
      window.localStorage.setItem(
        "histories",
        JSON.stringify([newRecord, ...histories].slice(10)),
      );
      loadHistories();
    },
    [histories, loadHistories],
  );

  const clearHistories = useCallback(() => {
    window.localStorage.setItem("histories", JSON.stringify([]));
    loadHistories();
  }, [loadHistories]);

  useEffect(() => {
    loadHistories();
  }, [loadHistories]);

  const history = histories.length ? (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <History
          className="text-primary-400 hover:text-default-foreground transition-all cursor-pointer"
          size={16}
          strokeWidth={3}
        />
      </DropdownTrigger>
      <DropdownMenu>
        {
          histories.map((item, index) => (
            <DropdownItem
              key={index}
              onClick={() => {
                setValue(item);
                router.push(`/search?s=${encodeURIComponent(item)}`);
              }}
            >
              {item}
            </DropdownItem>
          )) as any
        }
        <DropdownItem onClick={() => clearHistories()}>
          <Button
            className="w-full"
            color="danger"
            size="sm"
            startContent={<Trash2 size={14} strokeWidth={3} />}
          >
            {t("clearAll")}
          </Button>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ) : null;

  const form = (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        const searchValue = value.trim();

        if (searchValue) {
          saveHistories(searchValue);
        }

        let url = `/search?s=${encodeURIComponent(searchValue)}`;

        if (category) {
          url += `&c=${encodeURIComponent(category)}`;
        }
        router.push(url);
      }}
    >
      <Input
        classNames={{
          input: clsx(
            compact ? "text-sm font-medium" : "text-center font-semibold",
          ),
          mainWrapper: "group",
          inputWrapper: clsx(
            compact
              ? "h-10 min-h-10 border-default-200 bg-default-50/80 shadow-none hover:!border-primary-300 group-data-[focus=true]:!border-primary-500"
              : "!border-primary-900",
          ),
        }}
        endContent={compact ? null : history}
        placeholder={t("searchPlaceholder")}
        radius="full"
        size={compact ? "sm" : "lg"}
        startContent={
          <SearchIcon
            className={clsx(
              "transition-all",
              compact
                ? "text-default-400 group-hover:text-primary-600 group-data-[focus=true]:text-primary-800"
                : "text-primary-900 group-hover:text-primary-400 group-data-[focus=true]:text-default-foreground",
            )}
            size={compact ? 15 : 16}
            strokeWidth={compact ? 2.5 : 3}
          />
        }
        value={value}
        variant="bordered"
        onValueChange={setValue}
      />
    </form>
  );

  if (compact) {
    return <div className={clsx("w-full", className)}>{form}</div>;
  }

  return (
    <Container className={clsx("mt-10 sm:mt-16", className)}>
      <div className="max-w-[600px] mx-auto text-center relative">{form}</div>
    </Container>
  );
}
