import clsx from "clsx";
import { useTranslations } from "next-intl";
import { Istok_Web } from "next/font/google";

const istokWeb = Istok_Web({
  subsets: ["latin"],
  weight: "700",
});

export default function Title() {
  const t = useTranslations("submit");

  return (
    <div className={clsx("mx-auto mt-8 max-w-[812px] text-left")}>
      <h2
        className={clsx(
          istokWeb.className,
          "text-3xl font-bold leading-tight text-primary-900 sm:text-4xl",
        )}
      >
        {t("title")}
      </h2>
      <div className="mt-2 text-base font-normal text-primary-500 sm:text-lg">
        {t("subTitle")}
      </div>
    </div>
  );
}
