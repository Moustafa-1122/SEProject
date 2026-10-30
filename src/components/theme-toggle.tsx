
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card py-2 text-foreground shadow-sm transition-all hover:bg-accent"
    >
      <span className="text-lg">
        {isDark ? "☀️" : "🌙"}
      </span>

      {isDark ? "Light Mode" : "Dark Mode"}
    </Button>
  );
}
