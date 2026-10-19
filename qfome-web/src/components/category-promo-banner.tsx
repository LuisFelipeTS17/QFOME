"use client";

import { useEffect, useMemo, useState } from "react";
import { Flame, TimerReset } from "lucide-react";

type CategoryPromoBannerProps = {
  categoryName: string;
  categorySlug: string;
};

const PROMO_DURATION_MS = 4 * 60 * 60 * 1000;
const STORAGE_PREFIX = "qfome-category-promo-end-";

const formatRemainingTime = (remainingMs: number) => {
  const safeMs = Math.max(0, remainingMs);
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const getPromoEnd = (slug: string) => {
  if (typeof window === "undefined") {
    return Date.now() + PROMO_DURATION_MS;
  }

  const storageKey = `${STORAGE_PREFIX}${slug}`;
  const savedValue = localStorage.getItem(storageKey);
  const now = Date.now();

  if (savedValue) {
    const parsed = Number(savedValue);
    if (Number.isFinite(parsed) && parsed > now) {
      return parsed;
    }
  }

  const nextEnd = now + PROMO_DURATION_MS;
  localStorage.setItem(storageKey, String(nextEnd));
  return nextEnd;
};

export function CategoryPromoBanner({ categoryName, categorySlug }: CategoryPromoBannerProps) {
  const promoTitle = useMemo(
    () => `Pratos ${categoryName} com ate 30% OFF por tempo limitado`,
    [categoryName],
  );
  const [remainingLabel, setRemainingLabel] = useState("04:00:00");

  useEffect(() => {
    let promoEnd = getPromoEnd(categorySlug);

    const tick = () => {
      const now = Date.now();
      let remaining = promoEnd - now;

      if (remaining <= 0) {
        promoEnd = now + PROMO_DURATION_MS;
        localStorage.setItem(`${STORAGE_PREFIX}${categorySlug}`, String(promoEnd));
        remaining = promoEnd - now;
      }

      setRemainingLabel(formatRemainingTime(remaining));
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [categorySlug]);

  return (
    <div className="border-b border-[#f3c7b6] bg-gradient-to-r from-[#3b1916] via-[#6f1f1a] to-[#ab2b20] px-4 py-2 text-sm text-[#ffe9d2]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center text-center">
        <p className="flex flex-wrap items-center justify-center gap-2 font-extrabold uppercase tracking-[0.06em]">
          <Flame size={16} className="text-[#ffd27b]" />
          {promoTitle}
          <span className="inline-flex items-center gap-1 rounded-full border border-[#f6bf93] bg-[#ffd89d]/20 px-2 py-1 text-[11px]">
            <TimerReset size={12} />
            termina em {remainingLabel}
          </span>
        </p>
      </div>
    </div>
  );
}
