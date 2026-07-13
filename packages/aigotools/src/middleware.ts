import createMiddleware from "next-intl/middleware";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { localePrefix, locales } from "./navigation";
import { AvailableLocales } from "./lib/locales";
import { AppConfig } from "./lib/config";

const intlMiddleware = createMiddleware({
  locales: locales,
  defaultLocale: AvailableLocales[0],
  localePrefix: localePrefix,
});

const isManageRoute = createRouteMatcher(["/(.*)/dashboard"]);

const isUserRoute = createRouteMatcher(["/(.*)/submit"]);

function handleIntl(req: Parameters<typeof intlMiddleware>[0]) {
  const nextPathname = req.nextUrl.pathname;

  if (/^\/(api|trpc|sitemap)/.test(nextPathname)) {
    return;
  }

  return intlMiddleware(req);
}

function createProtectedRouteMiddleware() {
  return clerkMiddleware(
    (auth, req) => {
    if (isUserRoute(req)) auth().protect();

    if (isManageRoute(req)) {
      const { userId, redirectToSignIn } = auth();

      if (!userId || !AppConfig.manageUsers.includes(userId)) {
        return redirectToSignIn();
      }
    }

    return handleIntl(req);
    },
    { debug: AppConfig.debugClerk }
  );
}

function publicOnlyMiddleware(req: Parameters<typeof intlMiddleware>[0]) {
  const pathname = req.nextUrl.pathname;
  const isDashboardPath =
    pathname.startsWith("/dashboard") || /^\/[^/]+\/dashboard/.test(pathname);

  if (
    isDashboardPath &&
    req.cookies.get("saasDanceLocalAdmin")?.value !== "1"
  ) {
    return NextResponse.redirect(new URL("/admin-login", req.url));
  }

  if (
    isDashboardPath &&
    req.cookies.get("saasDanceLocalAdmin")?.value === "1" &&
    (pathname.includes("/dashboard/site-manage") ||
      pathname.includes("/dashboard/category-manage"))
  ) {
    return NextResponse.redirect(new URL("/dashboard/review-manage", req.url));
  }

  return handleIntl(req);
}

export default AppConfig.clerkEnabled
  ? createProtectedRouteMiddleware()
  : publicOnlyMiddleware;

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
