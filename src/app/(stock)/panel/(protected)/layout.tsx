import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { isStaff } from "@/lib/roles";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/panel/giris");
  }

  if (!isStaff(session.user.role)) {
    redirect("/magaza");
  }

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar userName={session.user.name ?? session.user.username ?? "Kullanıcı"} />
      <main className="flex-1 p-4 lg:ml-64 lg:p-8">{children}</main>
    </div>
  );
}
