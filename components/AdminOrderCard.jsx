import { useEffect, useState } from "react";
import { IoTrashOutline } from "react-icons/io5";
import { formatSAR } from "../utils/formatSAR";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  updateOrderStatus,
  deleteOrder,
} from "../services/orderService";

const BADGE = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  processing: "bg-sky-100 text-sky-800",
  rejected: "bg-red-100 text-red-800",
  paid: "bg-navy/10 text-navy",
};

function AdminOrderCard({ order }) {
  const [note, setNote] = useState(order.adminNote || "");
  const [status, setStatus] = useState(order.status);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setStatus(order.status);
    setNote(order.adminNote || "");
  }, [order.status, order.adminNote, order.updatedAt]);

  const isPending = status === ORDER_STATUS.PENDING;
  const isApproved = status === ORDER_STATUS.APPROVED;
  const isProcessing = status === ORDER_STATUS.PROCESSING;
  const isRejected = status === ORDER_STATUS.REJECTED;
  const isPaid = status === ORDER_STATUS.PAID;
  const canAct = isPending || isProcessing;

  const remove = async () => {
    if (
      !window.confirm(
        `Delete order ${order.id}? This cannot be undone.`
      )
    ) {
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const result = await deleteOrder(order.id);
      setMessage(result?.message || "Order deleted.");
    } catch {
      setMessage("Could not delete order. Try again.");
      setBusy(false);
    }
  };

  const update = async (nextStatus) => {
    setBusy(true);
    setMessage("");
    setStatus(nextStatus);
    try {
      const result = await updateOrderStatus(order.id, nextStatus, note.trim());
      const saved = result?.order || result;
      if (saved?.status) setStatus(saved.status);
      setMessage(
        result?.message || `Status updated: ${ORDER_STATUS_LABELS[nextStatus]}`
      );
    } catch {
      setStatus(order.status);
      setMessage("Could not update status. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(26,35,64,0.08)]">
      <div className="flex items-start justify-between gap-2 border-b border-gray-border/80 px-4 py-3">
        <div>
          <p className="text-[15px] font-bold text-navy">{order.id}</p>
          <p className="text-[11px] text-gray-muted">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${BADGE[status]}`}
        >
          {ORDER_STATUS_LABELS[status]}
        </span>
      </div>

      <div className="space-y-3 px-4 py-4">
        {message && (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-[12px] font-semibold text-emerald-700">
            {message}
          </p>
        )}

        <div className="rounded-xl bg-[#f8f9fc] p-3 text-[13px]">
          <p className="font-bold text-navy">{order.customer.name}</p>
          <p className="text-gray-muted">{order.customer.phone}</p>
          <p className="mt-1 text-[12px] text-gray-muted">{order.customer.address}</p>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-gray-muted">
            Items ({order.items.length})
          </p>
          <ul className="space-y-1.5">
            {order.items.map((item) => (
              <li
                key={`${item.type}-${item.id}`}
                className="flex justify-between gap-2 rounded-lg border border-gray-border/80 px-3 py-2 text-[12px]"
              >
                <span className="text-navy">
                  {item.title} ×{item.qty}
                </span>
                <span className="shrink-0 font-bold text-orange">{item.price}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-orange-pale px-3 py-2.5">
          <span className="text-[13px] font-semibold text-navy">Total</span>
          <span className="text-[18px] font-bold text-orange">{formatSAR(order.total)}</span>
        </div>

        {isApproved && (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-center text-[12px] font-semibold text-emerald-700">
            ✓ Approved — customer can pay now.
          </p>
        )}

        {isProcessing && (
          <p className="rounded-xl bg-sky-50 px-3 py-2 text-center text-[12px] font-semibold text-sky-700">
            ⟳ Order is being prepared in the kitchen.
          </p>
        )}

        {canAct && (
          <>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Note for customer (optional)"
              className="w-full resize-none rounded-xl border border-gray-border px-3 py-2 text-[12px] outline-none focus:border-orange"
            />
            <div
              className={`grid gap-2 ${
                isPending ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1"
              }`}
            >
              {isPending && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => update(ORDER_STATUS.APPROVED)}
                  className="rounded-xl bg-emerald-500 py-3 text-[12px] font-bold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-50"
                >
                  ✓ Approve
                </button>
              )}
              {isPending && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => update(ORDER_STATUS.PROCESSING)}
                  className="rounded-xl bg-sky-500 py-3 text-[12px] font-bold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-50"
                >
                  ⟳ Process
                </button>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => update(ORDER_STATUS.REJECTED)}
                className="rounded-xl bg-red-500 py-3 text-[12px] font-bold text-white shadow-sm transition hover:bg-red-600 disabled:opacity-50"
              >
                ✕ Reject
              </button>
            </div>
          </>
        )}

        {isRejected && (
          <div className="rounded-xl bg-red-50 px-3 py-2 text-center text-[12px] font-semibold text-red-700">
            <p>✕ Order rejected — customer was told items are unavailable.</p>
            {order.adminNote ? (
              <p className="mt-1 font-medium text-red-600">Note: {order.adminNote}</p>
            ) : null}
          </div>
        )}

        {isPaid && (
          <p className="rounded-xl bg-navy/5 px-3 py-2 text-center text-[12px] font-semibold text-navy">
            Order paid — no further action needed.
          </p>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={remove}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-[12px] font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
        >
          <IoTrashOutline className="h-4 w-4" />
          Delete Order
        </button>
      </div>
    </article>
  );
}

export default AdminOrderCard;
