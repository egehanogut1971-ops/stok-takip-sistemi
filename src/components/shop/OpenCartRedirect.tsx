"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartDrawer, type CartDrawerStep } from "@/components/shop/CartDrawerProvider";

export function OpenCartRedirect({ step = "cart" }: { step?: CartDrawerStep }) {
  const router = useRouter();
  const { openCart } = useCartDrawer();

  useEffect(() => {
    openCart(step);
    router.replace("/magaza");
  }, [openCart, router, step]);

  return null;
}
