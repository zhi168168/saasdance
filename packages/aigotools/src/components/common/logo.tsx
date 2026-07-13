import clsx from "clsx";
import Image from "next/image";
import React from "react";
import { Istok_Web } from "next/font/google";

import { AppConfig } from "@/lib/config";
import { Link } from "@/navigation";

const istokWeb = Istok_Web({
  subsets: ["latin"],
  weight: "700",
});

export default function Logo({ className }: { className?: string }) {
  return (
    <Link className="inline-flex items-center gap-2" href={"/"}>
      <Image
        priority
        alt=""
        className="h-7 w-7 sm:h-9 sm:w-9 rounded-md"
        height={36}
        src="/icon.png"
        width={36}
      />
      <h1
        className={clsx(
          "text-primary-800 font-bold text-2xl sm:text-4xl leading-none",
          className,
          istokWeb.className,
        )}
      >
        {AppConfig.siteName}
      </h1>
    </Link>
  );
}
