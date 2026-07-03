"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/profit";
import { ORDER_STATUS, ORDER_STATUS_LABELS } from "@/lib/orders";

type OrderItem = {
  id: string;
  productName: string;
  size: string;
  quantity: number;
  lineTotal: number;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_OPTIONS = [
  ORDER_STATUS.HAZIRLANIYOR,
  ORDER_STATUS.KARGODA,
  ORDER_STATUS.TESLIM_EDILDI,
  ORDER_STATUS.IPTAL,
];

export default function SiparislerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  function loadOrders() {
    setLoading(true);
    const url = filter ? `/api/orders?status=${filter}` : "/api/orders";
    fetch(url)
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOrders();
  }, [filter]);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadOrders();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Siparişler</h1>
        <p className="mt-1 text-lg text-slate-600">
          Online mağazadan gelen siparişler
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            !filter ? "bg-emerald-600 text-white" : "bg-white ring-1 ring-slate-200"
          }`}
        >
          Tümü
        </button>
        {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filter === key
                ? "bg-emerald-600 text-white"
                : "bg-white ring-1 ring-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-600">Yükleniyor...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white p-12 text-center text-slate-600">
          Henüz sipariş yok.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() =>
                  setExpanded(expanded === order.id ? null : order.id)
                }
                className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left"
              >
                <div>
                  <p className="font-mono font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-slate-600">
                    {order.guestName} ·{" "}
                    {new Date(order.createdAt).toLocaleString("tr-TR")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
                    {ORDER_STATUS_LABELS[
                      order.status as keyof typeof ORDER_STATUS_LABELS
                    ] ?? order.status}
                  </span>
                  <span className="font-bold">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </button>

              {expanded === order.id && (
                <div className="border-t px-4 pb-4 pt-3">
                  <p className="text-sm text-slate-600">
                    {order.guestEmail} · {order.guestPhone}
                  </p>
                  <ul className="mt-3 space-y-1 text-sm">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.productName} ({item.size}) × {item.quantity} —{" "}
                        {formatCurrency(item.lineTotal)}
                      </li>
                    ))}
                  </ul>
                  {order.status === ORDER_STATUS.ODENDI && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateStatus(order.id, status)}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                        >
                          {ORDER_STATUS_LABELS[status]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
