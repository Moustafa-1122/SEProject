"use client";

import { Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { useTheme } from "@/components/theme-provider";

type ThemeToggleProps = {
  placement?: "floating" | "sidebar";
};

export function ThemeToggle({ placement = "floating" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const pathname = usePathname();
  const nextTheme = theme === "dark" ? "light" : "dark";

  if (
    (placement === "floating" && pathname === "/dashboard") ||
    (placement === "sidebar" && pathname !== "/dashboard")
  ) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      aria-label={theme === "dark" ? t("Switch to light mode") : t("Switch to dark mode")}
      className={
        placement === "sidebar"
          ? "mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-[#0b1733] px-4 py-2 text-sm font-semibold text-blue-100 transition-colors hover:border-blue-300 hover:bg-blue-900"
          : "fixed bottom-16 end-4 z-[60] flex items-center gap-2 rounded-xl border border-blue-400/40 bg-[#0b1733] px-4 py-2 text-sm font-semibold text-blue-100 shadow-lg shadow-blue-950/40 transition-colors hover:border-blue-300 hover:bg-blue-900"
      }
    >
      {theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
      {t(theme === "dark" ? "Light mode" : "Dark mode")}
    </button>
  );
}
