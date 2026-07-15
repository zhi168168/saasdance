"use client";
import { useTranslations, useLocale } from "next-intl";
import { LogOut, Plus } from "lucide-react";
import clsx from "clsx";
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  useAuth,
  useUser,
} from "@clerk/nextjs";

import Search from "@/components/index/search";
import { AppConfig } from "@/lib/config";
import { Link, usePathname } from "@/navigation";

import Container from "./container";
import Logo from "./logo";
import { ThemeSwitcher } from "./theme-switcher";
import LanguageSwitcher from "./language-switcher";

export default function Header({ className }: { className?: string }) {
  const pathname = usePathname();
  const showSearch = pathname === "/";

  if (!AppConfig.clerkClientEnabled) {
    return <PublicHeader className={className} showSearch={showSearch} />;
  }

  return <AuthenticatedHeader className={className} showSearch={showSearch} />;
}

function HeaderSearch({ show }: { show: boolean }) {
  if (!show) {
    return null;
  }

  return (
    <Search
      compact
      className="hidden min-w-[220px] max-w-[380px] flex-1 xl:block"
    />
  );
}

function PublicHeader({
  className,
  showSearch,
}: {
  className?: string;
  showSearch: boolean;
}) {
  return (
    <Container
      className={clsx("flex items-center gap-4 h-20 sm:h-24", className)}
    >
      <div className="shrink-0">
        <Logo />
      </div>
      <HeaderSearch show={showSearch} />
      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
        <LanguageSwitcher />
        <ThemeSwitcher />
        <Link href={"/submit"}>
          <Button className="font-bold" color="primary" size="sm">
            <Plus size={15} strokeWidth={3} />
            Submit for free
          </Button>
        </Link>
        <Link href={"/dashboard/review-manage"}>
          <Button className="font-bold" size="sm" variant="bordered">
            Review Queue
          </Button>
        </Link>
      </div>
    </Container>
  );
}

function AuthenticatedHeader({
  className,
  showSearch,
}: {
  className?: string;
  showSearch: boolean;
}) {
  const t = useTranslations("header");

  const locale = useLocale();

  const user = useUser();
  const { signOut } = useAuth();

  const isManager =
    user.user?.id && AppConfig.manageUsers.includes(user.user.id);

  const forceRedirectUrl =
    typeof window === "undefined"
      ? null
      : `${window.location.origin}/${locale}/submit`;

  return (
    <Container
      className={clsx("flex items-center gap-4 h-20 sm:h-24", className)}
    >
      <div className="shrink-0">
        <Logo />
      </div>
      <HeaderSearch show={showSearch} />
      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
        <LanguageSwitcher />
        <ThemeSwitcher />
        <SignedOut>
          <SignInButton forceRedirectUrl={forceRedirectUrl} mode="modal">
            <Button className="font-semibold" color="primary" size="sm">
              {t("submit")}
            </Button>
          </SignInButton>
          <SignInButton mode="modal">
            <Button className="font-semibold" size="sm" variant="bordered">
              {t("login")}
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Link href={"/submit"}>
            <Button className="font-semibold" color="primary" size="sm">
              {t("submit")}
            </Button>
          </Link>
          {isManager && (
            <Link href={"/dashboard"} target="_blank">
              <Button
                className="font-semibold"
                color="primary"
                size="sm"
                variant="bordered"
              >
                {t("dashboard")}
              </Button>
            </Link>
          )}
          <Button
            className="font-semibold"
            color="danger"
            size="sm"
            startContent={<LogOut size={14} strokeWidth={3} />}
            variant="flat"
            onPress={() => signOut()}
          >
            Logout
          </Button>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                alt={user.user?.fullName || ""}
                className="cursor-pointer"
                size="sm"
                src={user.user?.imageUrl}
              />
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem
                className="text-danger-400 hover:!text-danger-500"
                startContent={<LogOut size={14} strokeWidth={3} />}
                onClick={() => signOut()}
              >
                Logout
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </SignedIn>
      </div>
    </Container>
  );
}
