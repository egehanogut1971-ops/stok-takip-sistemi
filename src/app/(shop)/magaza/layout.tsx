import { Plus_Jakarta_Sans } from "next/font/google";
import { auth } from "@/lib/auth";
import { isStaff } from "@/lib/roles";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ShopFooter } from "@/components/shop/ShopFooter";
import { StaffAdminBar } from "@/components/shop/StaffAdminBar";
import { getShopCategories } from "@/lib/shop";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: React.ReactNode;
};

export default async function ShopLayout({ children }: LayoutProps) {
  const [categories, session] = await Promise.all([
    getShopCategories(),
    auth(),
  ]);
  const showStaffBar = session?.user && isStaff(session.user.role);

  return (
    <div
      className={`shop-theme flex min-h-screen flex-col ${plusJakarta.variable}`}
    >
      {showStaffBar && <StaffAdminBar />}
      <ShopHeader categories={categories} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-8">
        {children}
      </main>
      <ShopFooter />
    </div>
  );
}
