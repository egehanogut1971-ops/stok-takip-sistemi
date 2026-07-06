"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartDrawerStep = "cart" | "checkout";

type CartDrawerContextValue = {
  isOpen: boolean;
  step: CartDrawerStep;
  cartCount: number;
  openCart: (step?: CartDrawerStep) => void;
  closeCart: () => void;
  goToCheckout: () => void;
  goToCart: () => void;
  refreshCartCount: () => Promise<void>;
};

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

export function useCartDrawer() {
  const ctx = useContext(CartDrawerContext);
  if (!ctx) {
    throw new Error("useCartDrawer must be used within CartDrawerProvider");
  }
  return ctx;
}

export function CartDrawerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<CartDrawerStep>("cart");
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = useCallback(async () => {
    try {
      const res = await fetch("/api/shop/cart");
      const data = await res.json();
      setCartCount(data.itemCount ?? 0);
    } catch {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    refreshCartCount();
  }, [refreshCartCount]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const openCart = useCallback(
    (nextStep: CartDrawerStep = "cart") => {
      setStep(nextStep);
      setIsOpen(true);
      refreshCartCount();
    },
    [refreshCartCount],
  );

  const closeCart = useCallback(() => {
    setIsOpen(false);
    setStep("cart");
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      step,
      cartCount,
      openCart,
      closeCart,
      goToCheckout: () => setStep("checkout"),
      goToCart: () => setStep("cart"),
      refreshCartCount,
    }),
    [isOpen, step, cartCount, openCart, closeCart, refreshCartCount],
  );

  return (
    <CartDrawerContext.Provider value={value}>
      {children}
    </CartDrawerContext.Provider>
  );
}
