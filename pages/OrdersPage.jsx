import { useEffect, useMemo, useState } from "react";
import { IoTrashOutline } from "react-icons/io5";
import AdminOrderCard from "../components/AdminOrderCard";
import {
  ORDER_STATUS,
  readOrders,
  subscribeOrdersUpdated,
  bootstrapOrders,
  deleteOrders,
} from "../services/orderService";

const TABS = [
  { id: ORDER_STATUS.PENDING, label: "New" },
  { id: ORDER_STATUS.APPROVED, label: "Approved" },
  { id: ORDER_STATUS.REJECTED, label: "Rejected" },
  { id: ORDER_STATUS.PROCESSING, label: "Processing" },
  { id: ORDER_STATUS.PAID, label: "Paid" },
  { id: "all", label: "All" },
];

const TAB_DELETE_LABEL = {
  [ORDER_STATUS.PENDING]: "new",
  [ORDER_STATUS.APPROVED]: "approved",
  [ORDER_STATUS.REJECTED]: "rejected",
  [ORDER_STATUS.PROCESSING]: "processing",
  [ORDER_STATUS.PAID]: "paid",
  all: "shown",
};

function OrdersPage() {
  const [orders, setOrders] = useState(() => readOrders());
  const [tab, setTab] = useState(ORDER_STATUS.PENDING);
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    bootstrapOrders().then(() => setOrders(readOrders()));
    return subscribeOrdersUpdated(() => setOrders(readOrders()));
  }, []);

  const filtered = useMemo(() => {
    if (tab === "all") return orders;
    return orders.filter((o) => o.status === tab);
  }, [orders, tab]);

  const newCount = orders.filter((o) => o.status === ORDER_STATUS.PENDING).length;

  const handleDeleteAll = async () => {
    if (!filtered.length) return;

    const label = TAB_DELETE_LABEL[tab] || "shown";
    if (
      !window.confirm(
        `Delete all ${filtered.length} ${label} order${filtered.length > 1 ? "s" : ""}? This cannot be undone.`
      )
    ) {
      return;
    }

    setBulkBusy(true);
    try {
      await deleteOrders(filtered.map((o) => o.id));
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {newCount > 0 && (
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-orange to-orange-dark p-4 text-white shadow-lg">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-[18px] font-bold">
            {newCount}
          </span>
          <div>
            <p className="font-bold">New order{newCount > 1 ? "s" : ""} waiting</p>
            <p className="text-[12px] text-white/85">Check items & tap Approve or Reject</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => {
            const n =
              t.id === "all"
                ? orders.length
                : orders.filter((o) => o.status === t.id).length;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                  tab === t.id
                    ? "bg-navy text-white shadow-md"
                    : "bg-white text-navy shadow-sm"
                }`}
              >
                {t.label}
                {n > 0 ? ` (${n})` : ""}
              </button>
            );
          })}
        </div>

        {filtered.length > 0 && (
          <button
            type="button"
            disabled={bulkBusy}
            onClick={handleDeleteAll}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[12px] font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
          >
            <IoTrashOutline className="h-4 w-4" />
            {bulkBusy
              ? "Deleting..."
              : `Delete all ${TAB_DELETE_LABEL[tab]} (${filtered.length})`}
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
          <p className="text-4xl">{tab === ORDER_STATUS.REJECTED ? "✕" : "📭"}</p>
          <p className="mt-3 text-[16px] font-bold text-navy">
            {tab === ORDER_STATUS.REJECTED ? "No rejected orders" : "No orders yet"}
          </p>
          <p className="mt-1 text-[13px] text-gray-muted">
            {tab === ORDER_STATUS.REJECTED
              ? "Rejected orders will appear here with items and notes."
              : "Orders from the website will show here automatically."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <AdminOrderCard key={`${order.id}-${order.status}-${order.updatedAt}`} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
