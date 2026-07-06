"use client";

import { CartView } from "@/components/shop/CartView";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { useCartDrawer } from "@/components/shop/CartDrawerProvider";

type CartDrawerProps = {
  paymentEnabled: boolean;
};

export function CartDrawer({ paymentEnabled }: CartDrawerProps) {
  const { isOpen, step, closeCart, goToCheckout, goToCart, refreshCartCount } =
    useCartDrawer();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        aria-label="Sepeti kapat"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={closeCart}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Sepet"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[var(--shop-surface)] shadow-2xl transition-transform duration-300 ease-[var(--shop-ease)]"
        style={{ animation: "cartSlideIn var(--shop-duration) var(--shop-ease)" }}
      >
        <div className="flex items-center justify-between border-b border-[var(--shop-border)] px-6 py-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--shop-text-muted)]">
              {step === "cart" ? "Sepetim" : "Ödeme"}
            </p>
            <h2 className="font-display text-xl text-[var(--shop-text-primary)]">
              {step === "cart" ? "Seçtikleriniz" : "Teslimat"}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--shop-border)] text-[var(--shop-text-muted)] hover:text-[var(--shop-text-primary)]"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {step === "cart" ? (
            <CartView
              variant="drawer"
              paymentEnabled={paymentEnabled}
              onCheckout={goToCheckout}
              onCartUpdate={refreshCartCount}
            />
          ) : (
            <CheckoutForm
              variant="drawer"
              paymentEnabled={paymentEnabled}
              onBack={goToCart}
              onSuccess={() => {
                refreshCartCount();
                closeCart();
              }}
            />
          )}
        </div>
      </aside>
    </div>
  );
}
