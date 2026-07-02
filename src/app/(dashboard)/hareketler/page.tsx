"use client";

import { useEffect, useState } from "react";
import { MOVEMENT_LABELS, type MovementType } from "@/lib/constants";

type Movement = {
  id: string;
  type: string;
  quantity: number;
  note: string | null;
  createdAt: string;
  product: { name: string; unit: string; category: { name: string } };
  user: { name: string };
};

export default function MovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function load() {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    fetch(`/api/movements?${params}`)
      .then((r) => r.json())
      .then(setMovements);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stok Hareketleri</h1>
        <p className="mt-1 text-lg text-slate-600">Kim, ne zaman, ne yaptı</p>
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
              <th className="px-4 py-3 text-left">Tür</th>
              <th className="px-4 py-3 text-left">Miktar</th>
              <th className="px-4 py-3 text-left">Kim</th>
              <th className="px-4 py-3 text-left">Not</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="px-4 py-3">{new Date(m.createdAt).toLocaleString("tr-TR")}</td>
                <td className="px-4 py-3">{m.product.name}</td>
                <td className="px-4 py-3">{MOVEMENT_LABELS[m.type as MovementType] ?? m.type}</td>
                <td className="px-4 py-3">{m.quantity} {m.product.unit}</td>
                <td className="px-4 py-3 font-medium">{m.user.name}</td>
                <td className="px-4 py-3 text-slate-600">{m.note ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
