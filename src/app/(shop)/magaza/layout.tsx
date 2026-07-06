import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import { auth } from "@/lib/auth";
import { isStaff } from "@/lib/roles";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ShopFooter } from "@/components/shop/ShopFooter";
import { StaffAdminBar } from "@/components/shop/StaffAdminBar";
import { CartDrawerProvider } from "@/components/shop/CartDrawerProvider";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { isPaymentEnabled } from "@/lib/shopConfig";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: React.ReactNode;
};

export default async function ShopLayout({ children }: LayoutProps) {
  const [session, paymentEnabled] = await Promise.all([auth(), Promise.resolve(isPaymentEnabled())]);
  const showStaffBar = session?.user && isStaff(session.user.role);

  return (
    <div
      className={`shop-theme flex min-h-screen flex-col ${plusJakarta.variable} ${cormorant.variable}`}
    >
      <CartDrawerProvider>
        {showStaffBar && <StaffAdminBar />}
        <ShopHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-8">
          {children}
        </main>
        <ShopFooter />
        <CartDrawer paymentEnabled={paymentEnabled} />
      </CartDrawerProvider>
    </div>
  );
}
