"use client";

import { useState } from "react";
import { AddToCartForm } from "@/components/shop/AddToCartForm";

type SizeOption = {
  id: string;
  size: string;
  currentStock: number;
};

export function ProductGallery({
  images,
  displayName,
}: {
  images: { id: string; url: string }[];
  displayName: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active];

  if (images.length === 0) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center bg-[var(--shop-surface-muted)] text-[var(--shop-text-faint)]">
        Görsel yok
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="aspect-[3/4] overflow-hidden bg-[var(--shop-surface-muted)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current?.url}
          alt={displayName}
          className="h-full w-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
              className={`h-20 w-16 shrink-0 overflow-hidden border ${
                index === active
                  ? "border-[var(--shop-accent)]"
                  : "border-[var(--shop-border)] opacity-70"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductPurchasePanel({
  sizes,
  inStock,
  displayName,
}: {
  sizes: SizeOption[];
  inStock: boolean;
  displayName: string;
}) {
  return (
    <div className="lg:sticky lg:top-24 lg:self-start">
      <div className="hidden lg:block">
        <AddToCartForm sizes={sizes} disabled={!inStock} />
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--shop-border)] bg-[var(--shop-surface)] p-4 lg:hidden">
        <p className="mb-2 text-center text-sm font-medium">{displayName}</p>
        <AddToCartForm sizes={sizes} disabled={!inStock} compact />
      </div>
      <div className="pb-24 lg:pb-0" aria-hidden />
    </div>
  );
}
