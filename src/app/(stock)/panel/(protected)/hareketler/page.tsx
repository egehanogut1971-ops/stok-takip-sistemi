"use client";

import { useEffect, useState } from "react";
import {
  MOVEMENT_LABELS,
  MOVEMENT_SOURCE_LABELS,
  MOVEMENT_SOURCES,
  type MovementSource,
  type MovementType,
} from "@/lib/constants";

type Movement = {
  id: string;
  type: string;
  source: string;
  quantity: number;
  note: string | null;
  createdAt: string;
  productSize: {
    size: string;
    product: { name: string; category: { name: string } };
  };
  user: { name: string };
};

const SOURCE_FILTERS = [
  { value: "", label: "Tümü" },
  { value: MOVEMENT_SOURCES.WEB, label: "Web Satışı" },
  { value: MOVEMENT_SOURCES.MANUAL, label: "Manuel" },
];

export default function MovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [sourceFilter, setSourceFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function load() {
    const params = new URLSearchParams();
    if (sourceFilter) params.set("source", sourceFilter);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    fetch(`/api/movements?${params}`)
      .then((r) => r.json())
      .then(setMovements);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stok Hareketleri</h1>
        <p className="mt-1 text-lg text-slate-600">Kim, ne zaman, ne yaptı</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SOURCE_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setSourceFilter(filter.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              sourceFilter === filter.value
                ? "bg-emerald-600 text-white"
                : "bg-white ring-1 ring-slate-200"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border bg-white p-4 shadow-sm">
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border px-4 py-2" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border px-4 py-2" />
        <button onClick={load} className="rounded-lg bg-slate-800 px-4 py-2 text-white">Filtrele</button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="min-w-full text-base">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Tarih</th>
              <th className="px-4 py-3 text-left">Ürün</th>
              <th className="px-4 py-3 text-left">Beden</th>
              <th className="px-4 py-3 text-left">Kaynak</th>
              <th className="px-4 py-3 text-left">Tür</th>
              <th className="px-4 py-3 text-left">Miktar</th>
              <th className="px-4 py-3 text-left">Not</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="px-4 py-3">{new Date(m.createdAt).toLocaleString("tr-TR")}</td>
                <td className="px-4 py-3">{m.productSize.product.name}</td>
                <td className="px-4 py-3">{m.productSize.size}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      m.source === MOVEMENT_SOURCES.WEB
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {MOVEMENT_SOURCE_LABELS[m.source as MovementSource] ?? m.source}
                  </span>
                </td>
                <td className="px-4 py-3">{MOVEMENT_LABELS[m.type as MovementType] ?? m.type}</td>
                <td className="px-4 py-3">{m.quantity} adet</td>
                <td className="px-4 py-3 text-sm text-slate-600">{m.note ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
