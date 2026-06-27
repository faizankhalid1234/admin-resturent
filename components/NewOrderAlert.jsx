import { useEffect, useRef, useState, useCallback } from "react";
import {
  IoClose,
  IoRestaurantOutline,
  IoVolumeHigh,
  IoChevronBack,
  IoNotifications,
} from "react-icons/io5";
import {
  bootstrapOrders,
  readOrders,
  subscribeOrdersUpdated,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  updateOrderStatus,
} from "../services/orderService";
import {
  startPendingOrderAlert,
  stopPendingOrderAlert,
  setPendingRingtoneActive,
  unlockOrderAlertAudio,
  onSoundBlockChange,
} from "../utils/playOrderAlert";
import { formatSAR } from "../utils/formatSAR";

function OrderItemRow({ item }) {
  const [imgErr, setImgErr] = useState(false);
  const lineTotal = item.qty > 1 ? `${item.price} × ${item.qty}` : item.price;

  return (
    <li className="flex gap-2.5 rounded-lg border border-gray-border/80 bg-[#fafbfc] p-2">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
        {!imgErr && item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover"
            onError={() => setImgErr(true)}
          />
        ) : (
          <IoRestaurantOutline className="h-5 w-5 text-gray-muted" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[12px] font-bold text-navy">{item.title}</p>
        <p className="mt-0.5 text-[12px] font-bold text-orange">{lineTotal}</p>
      </div>
    </li>
  );
}

function getPendingOrders() {
  return readOrders().filter((o) => o.status === ORDER_STATUS.PENDING);
}

function SideOrderActions({ order }) {
  const [note, setNote] = useState(order.adminNote || "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setNote(order.adminNote || "");
    setMessage("");
  }, [order.id, order.adminNote, order.updatedAt]);

  const update = async (nextStatus) => {
    setBusy(true);
    setMessage("");
    try {
      const result = await updateOrderStatus(order.id, nextStatus, note.trim());
      setMessage(result?.message || `Status: ${ORDER_STATUS_LABELS[nextStatus]}`);
    } catch {
      setMessage("Could not update. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 border-t border-gray-border/80 pt-3">
      {message && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-700">
          {message}
        </p>
      )}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Note for customer (optional)"
        className="w-full resize-none rounded-xl border border-gray-border px-3 py-2 text-[12px] outline-none focus:border-orange"
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => update(ORDER_STATUS.APPROVED)}
          className="rounded-xl bg-emerald-500 py-2.5 text-[11px] font-bold text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          ✓ Approve
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => update(ORDER_STATUS.PROCESSING)}
          className="rounded-xl bg-sky-500 py-2.5 text-[11px] font-bold text-white hover:bg-sky-600 disabled:opacity-50"
        >
          ⟳ Process
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => update(ORDER_STATUS.REJECTED)}
          className="rounded-xl bg-red-500 py-2.5 text-[11px] font-bold text-white hover:bg-red-600 disabled:opacity-50"
        >
          ✕ Reject
        </button>
      </div>
    </div>
  );
}

export default function NewOrderAlert() {
  const [selectedId, setSelectedId] = useState(null);
  const [minimized, setMinimized] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [soundBlocked, setSoundBlocked] = useState(false);
  const knownIdsRef = useRef(new Set());
  const readyRef = useRef(false);

  const pending = getPendingOrders();
  const current = selectedId
    ? readOrders().find((o) => o.id === selectedId && o.status === ORDER_STATUS.PENDING)
    : pending[0] || null;

  const tryPlaySound = useCallback(async () => {
    const list = getPendingOrders();
    if (!list.length) {
      setPendingRingtoneActive(false);
      return false;
    }

    setPendingRingtoneActive(true);
    await unlockOrderAlertAudio();
    const result = await startPendingOrderAlert();
    setSoundBlocked(result.blocked);
    return result.ok;
  }, []);

  const syncPendingSound = useCallback(() => {
    if (!readyRef.current) return;

    const list = getPendingOrders();
    setPendingCount(list.length);

    window.dispatchEvent(
      new CustomEvent("admin-order-panel", {
        detail: { open: list.length > 0 && !minimized },
      })
    );

    if (list.length > 0) {
      if (!selectedId || !list.some((o) => o.id === selectedId)) {
        setSelectedId(list[0].id);
      }
      tryPlaySound();
    } else {
      setSelectedId(null);
      setMinimized(false);
      setPendingRingtoneActive(false);
      stopPendingOrderAlert();
    }
  }, [minimized, selectedId, tryPlaySound]);

  const onOrdersUpdated = useCallback(() => {
    if (!readyRef.current) return;

    getPendingOrders().forEach((o) => knownIdsRef.current.add(o.id));
    syncPendingSound();
  }, [syncPendingSound]);

  useEffect(() => {
    const unlock = () => {
      if (getPendingOrders().length > 0) {
        unlockOrderAlertAudio().then(() => tryPlaySound());
      }
    };

    document.addEventListener("click", unlock);
    document.addEventListener("keydown", unlock);
    document.addEventListener("touchstart", unlock, { passive: true });

    return onSoundBlockChange(setSoundBlocked);
  }, [tryPlaySound]);

  useEffect(() => {
    bootstrapOrders().then(() => {
      readOrders().forEach((o) => knownIdsRef.current.add(o.id));
      readyRef.current = true;
      onOrdersUpdated();
    });

    const unsub = subscribeOrdersUpdated(onOrdersUpdated);

    return () => {
      unsub();
      setPendingRingtoneActive(false);
      stopPendingOrderAlert();
    };
  }, [onOrdersUpdated]);

  if (!pendingCount || !current) {
    return null;
  }

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => {
          setMinimized(false);
          window.dispatchEvent(
            new CustomEvent("admin-order-panel", { detail: { open: true } })
          );
        }}
        className="fixed bottom-4 right-4 z-[90] flex items-center gap-2 rounded-full bg-orange px-4 py-3 text-[13px] font-bold text-white shadow-lg animate-pulse"
      >
        <IoNotifications className="h-5 w-5" />
        {pendingCount} new order{pendingCount > 1 ? "s" : ""}
      </button>
    );
  }

  return (
    <aside
      role="alert"
      className="fixed right-0 top-0 z-[90] flex h-full w-full max-w-[min(100%,420px)] flex-col border-l border-orange/20 bg-white shadow-[-8px_0_32px_rgba(26,35,64,0.12)] animate-[fadeSlideIn_0.3s_ease]"
    >
      <div className="shrink-0 bg-gradient-to-r from-orange via-[#fb923c] to-orange-dark px-4 py-3.5 text-white">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/25 text-xl animate-[bell-ring_0.55s_ease-in-out_infinite]">
              🔔
            </span>
            <div>
              <p className="text-[15px] font-bold">New Order{pendingCount > 1 ? "s" : ""}</p>
              <p className="text-[11px] text-white/90">
                {pendingCount > 1
                  ? `${pendingCount} waiting — change status to stop ringtone`
                  : "Approve or reject to stop ringtone"}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => {
                setMinimized(true);
                window.dispatchEvent(
                  new CustomEvent("admin-order-panel", { detail: { open: false } })
                );
              }}
              className="rounded-lg p-1.5 hover:bg-white/15"
              aria-label="Minimize"
              title="Minimize"
            >
              <IoChevronBack className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setMinimized(true);
                window.dispatchEvent(
                  new CustomEvent("admin-order-panel", { detail: { open: false } })
                );
              }}
              className="rounded-lg p-1.5 hover:bg-white/15"
              aria-label="Hide panel"
            >
              <IoClose className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {soundBlocked && (
        <button
          type="button"
          onClick={() => tryPlaySound()}
          className="flex shrink-0 items-center justify-center gap-2 bg-amber-400 px-4 py-2.5 text-[12px] font-bold text-navy"
        >
          <IoVolumeHigh className="h-4 w-4" />
          Tap to play ringtone
        </button>
      )}

      {pendingCount > 1 && (
        <div className="shrink-0 border-b border-gray-border/80 bg-[#f8f9fc] px-3 py-2">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-muted">
            Select order
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {pending.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setSelectedId(o.id)}
                className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${
                  current.id === o.id
                    ? "bg-navy text-white"
                    : "bg-white text-navy ring-1 ring-gray-border"
                }`}
              >
                {o.id.slice(-6)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <div className="rounded-xl bg-[#f8f9fc] p-3">
          <p className="text-[14px] font-bold text-navy">{current.id}</p>
          <p className="mt-1 text-[12px] font-semibold text-navy">{current.customer?.name}</p>
          <p className="text-[11px] text-gray-muted">{current.customer?.phone}</p>
          <p className="text-[11px] text-gray-muted">{current.customer?.address}</p>
        </div>

        <div className="mt-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-muted">
            Items ({current.items?.length || 0})
          </p>
          <ul className="space-y-1.5">
            {(current.items || []).map((item) => (
              <OrderItemRow key={`${item.type}-${item.id}-${item.title}`} item={item} />
            ))}
          </ul>
        </div>

        <div className="mt-3 rounded-xl bg-orange-pale px-3 py-2.5">
          <div className="flex justify-between text-[12px] text-navy">
            <span>Subtotal</span>
            <span className="font-semibold">{formatSAR(current.subtotal)}</span>
          </div>
          <div className="mt-1 flex justify-between text-[12px] text-navy">
            <span>Delivery</span>
            <span className="font-semibold">{formatSAR(current.deliveryFee)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-orange/20 pt-2">
            <span className="text-[13px] font-bold text-navy">Total</span>
            <span className="text-[16px] font-bold text-orange">{formatSAR(current.total)}</span>
          </div>
        </div>

        <SideOrderActions order={current} />
      </div>

      <p className="shrink-0 border-t border-gray-border/80 bg-[#f8f9fc] px-4 py-2 text-center text-[10px] text-gray-muted">
        Left side — orders page is still usable
      </p>
    </aside>
  );
}
