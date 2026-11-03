"use client";

import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/language-provider";

type LanguageToggleProps = {
  placement?: "floating" | "sidebar";
};

export function LanguageToggle({ placement = "floating" }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const nextLanguage = language === "en" ? "ar" : "en";

  if (
    (placement === "floating" && pathname === "/dashboard") ||
    (placement === "sidebar" && pathname !== "/dashboard")
  ) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => setLanguage(nextLanguage)}
      aria-label={language === "en" ? "Switch to Arabic" : "Switch to English"}
      className={
        placement === "sidebar"
          ? "flex w-full items-center justify-center rounded-lg border border-blue-500/30 bg-[#0b1733] px-4 py-2 text-sm font-semibold text-blue-100 transition-colors hover:border-blue-300 hover:bg-blue-900"
          : "fixed bottom-4 end-4 z-[60] rounded-xl border border-blue-400/40 bg-[#0b1733] px-4 py-2 text-sm font-semibold text-blue-100 shadow-lg shadow-blue-950/40 transition-colors hover:border-blue-300 hover:bg-blue-900"
      }
    >
      {language === "en" ? "العربية" : "English"}
    </button>
  );
}
