import { Suspense } from "react";
import { ShopLoginForm } from "./ShopLoginForm";

export default function ShopLoginPage() {
  return (
    <Suspense fallback={<p className="text-[var(--shop-text-muted)]">Yükleniyor...</p>}>
      <ShopLoginForm />
    </Suspense>
  );
}
