import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getStockRows } from "@/lib/stockRows";
import { CategoryFilter } from "@/components/CategoryFilter";
import { StockPrintActions } from "@/components/StockPrintView";
import { StockSummary, StockTable } from "@/components/StockTable";
import { SearchBox } from "@/components/SearchBox";
import { CsvExportButton } from "@/components/CsvExportButton";

type PageProps = {
  searchParams: Promise<{ categoryId?: string; q?: string }>;
};

export default async function StockPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categoryId = params.categoryId;
  const q = params.q?.trim();

  const [categories, rows] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getStockRows({ categoryId, q }),
  ]);

  const categoryName = categoryId
    ? categories.find((c) => c.id === categoryId)?.name
    : undefined;

  return (
    <div className="space-y-6">
      <div className="no-print">
        <h1 className="text-3xl font-bold text-slate-900">Mevcut Stok</h1>
        <p className="mt-1 text-lg text-slate-600">
          Elimizdeki güncel stok durumu
        </p>
      </div>

      <div className="no-print flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Suspense fallback={null}>
          <CategoryFilter categories={categories} />
        </Suspense>
        <Suspense fallback={null}>
          <SearchBox />
        </Suspense>
      </div>

      <div className="no-print">
        <StockSummary rows={rows} />
      </div>
      <div className="no-print flex flex-wrap gap-3">
        <StockPrintActions rows={rows} categoryName={categoryName} />
        <CsvExportButton rows={rows} />
      </div>
      <StockTable rows={rows} />
    </div>
  );
}
