"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronLeft, GraduationCap } from "lucide-react";
import { ModuleList } from "@/components/learn/ModuleList";

/**
 * Community Education Portal index (#101) — a hub for learning about currency
 * volatility and hedging. Links out to the interactive `/learn/[slug]` modules.
 */
export default function LearnPage() {
  const t = useTranslations("learn");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("back")}
        </Link>

        <div className="mb-1 flex items-center gap-3">
          <GraduationCap className="h-6 w-6 text-primary" aria-hidden="true" />
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("title")}
          </h1>
        </div>
        <p className="mb-8 max-w-xl text-sm text-muted-foreground">
          {t("subtitle")}
        </p>

        <ModuleList />

        <p className="mt-8 text-xs text-muted-foreground">{t("disclaimer")}</p>
      </div>
    </main>
  );
}
