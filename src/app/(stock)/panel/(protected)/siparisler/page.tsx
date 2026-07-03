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
  trackingNumber: string | null;
  carrier: string | null;
  items: OrderItem[];
};

const STATUS_OPTIONS = [
  ORDER_STATUS.HAZIRLANIYOR,
  ORDER_STATUS.KARGODA,
  ORDER_STATUS.TESLIM_EDILDI,
  ORDER_STATUS.IPTAL,
];

const CARRIER_OPTIONS = ["Yurtiçi Kargo", "Aras Kargo", "MNG Kargo", "PTT Kargo"];

export default function SiparislerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [trackingDrafts, setTrackingDrafts] = useState<
    Record<string, { trackingNumber: string; carrier: string }>
  >({});

  function loadOrders() {
    setLoading(true);
    const url = filter ? `/api/orders?status=${filter}` : "/api/orders";
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setOrders(list);
        setTrackingDrafts((prev) => {
          const next = { ...prev };
          for (const order of list) {
            if (!next[order.id]) {
              next[order.id] = {
                trackingNumber: order.trackingNumber ?? "",
                carrier: order.carrier ?? "Yurtiçi Kargo",
              };
            }
          }
          return next;
        });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOrders();
  }, [filter]);

  async function updateStatus(
    id: string,
    status: string,
    tracking?: { trackingNumber: string; carrier: string },
  ) {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        trackingNumber: tracking?.trackingNumber,
        carrier: tracking?.carrier,
      }),
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
          {orders.map((order) => {
            const draft = trackingDrafts[order.id] ?? {
              trackingNumber: order.trackingNumber ?? "",
              carrier: order.carrier ?? "Yurtiçi Kargo",
            };

            return (
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
                    {order.trackingNumber && (
                      <p className="mt-2 text-sm text-slate-700">
                        Kargo: {order.carrier ?? "—"} · {order.trackingNumber}
                      </p>
                    )}
                    <ul className="mt-3 space-y-1 text-sm">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.productName} ({item.size}) × {item.quantity} —{" "}
                          {formatCurrency(item.lineTotal)}
                        </li>
                      ))}
                    </ul>

                    {[ORDER_STATUS.ODENDI, ORDER_STATUS.HAZIRLANIYOR].includes(
                      order.status as typeof ORDER_STATUS.ODENDI,
                    ) && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => {
                              if (status === ORDER_STATUS.KARGODA) {
                                updateStatus(order.id, status, draft);
                              } else {
                                updateStatus(order.id, status);
                              }
                            }}
                            className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                          >
                            {ORDER_STATUS_LABELS[status]}
                          </button>
                        ))}
                      </div>
                    )}

                    {[ORDER_STATUS.ODENDI, ORDER_STATUS.HAZIRLANIYOR, ORDER_STATUS.KARGODA].includes(
                      order.status as typeof ORDER_STATUS.ODENDI,
                    ) && (
                      <div className="mt-4 grid gap-3 rounded-lg bg-slate-50 p-4 md:grid-cols-[1fr_1fr_auto]">
                        <input
                          placeholder="Takip numarası"
                          value={draft.trackingNumber}
                          onChange={(e) =>
                            setTrackingDrafts({
                              ...trackingDrafts,
                              [order.id]: {
                                ...draft,
                                trackingNumber: e.target.value,
                              },
                            })
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                        <select
                          value={draft.carrier}
                          onChange={(e) =>
                            setTrackingDrafts({
                              ...trackingDrafts,
                              [order.id]: {
                                ...draft,
                                carrier: e.target.value,
                              },
                            })
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        >
                          {CARRIER_OPTIONS.map((carrier) => (
                            <option key={carrier} value={carrier}>
                              {carrier}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() =>
                            updateStatus(order.id, ORDER_STATUS.KARGODA, draft)
                          }
                          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                          Kargoya ver
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
