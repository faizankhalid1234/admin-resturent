const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const ORDERS_API = `${API_URL}/api/orders`;
export const ORDER_POLL_MS = 30000;

export const ORDER_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  PROCESSING: "processing",
  REJECTED: "rejected",
  PAID: "paid",
};

export const ORDER_STATUS_LABELS = {
  pending: "Pending review",
  approved: "Approved",
  processing: "Processing",
  rejected: "Rejected",
  paid: "Paid",
};

let ordersCache = null;
let bootstrapPromise = null;
let pollTimer = null;
let pollListenerCount = 0;
let pollInFlight = false;

function notifyOrdersUpdated() {
  window.dispatchEvent(new CustomEvent("orders-updated"));
}

function orderFingerprint(order) {
  return `${order.status}|${order.updatedAt}|${order.adminNote || ""}`;
}

function ordersChanged(current, fresh) {
  if (current.length !== fresh.length) return true;
  const freshMap = new Map(fresh.map((o) => [o.id, orderFingerprint(o)]));
  return current.some((o) => freshMap.get(o.id) !== orderFingerprint(o));
}

async function fetchOrdersFromApi() {
  const res = await fetch(ORDERS_API);
  if (!res.ok) throw new Error("Orders API unavailable");
  return res.json();
}

async function patchOrderToApi(id, patch) {
  const res = await fetch(`${ORDERS_API}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to update order");
  const data = await res.json();
  return data.order || data;
}

async function runOrderPoll() {
  if (pollInFlight) return;
  pollInFlight = true;

  try {
    const fresh = await fetchOrdersFromApi();
    const current = readOrders();
    if (ordersChanged(current, fresh)) {
      ordersCache = fresh;
      notifyOrdersUpdated();
    }
  } catch {
    /* API not ready */
  } finally {
    pollInFlight = false;
  }
}

function startOrderPolling() {
  if (pollTimer) return;
  pollTimer = setInterval(runOrderPoll, ORDER_POLL_MS);
  document.addEventListener("visibilitychange", onVisibilityChange);
}

function stopOrderPolling() {
  if (!pollTimer) return;
  clearInterval(pollTimer);
  pollTimer = null;
  document.removeEventListener("visibilitychange", onVisibilityChange);
}

function onVisibilityChange() {
  if (document.visibilityState === "visible") {
    runOrderPoll();
  }
}

export async function bootstrapOrders() {
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    try {
      ordersCache = await fetchOrdersFromApi();
      notifyOrdersUpdated();
      return ordersCache;
    } catch {
      ordersCache = [];
      return ordersCache;
    }
  })();

  return bootstrapPromise;
}

export function readOrders() {
  return ordersCache || [];
}

export async function updateOrder(id, patch) {
  const orders = readOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;

  const updated = {
    ...orders[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  orders[idx] = updated;
  ordersCache = [...orders];
  notifyOrdersUpdated();

  const data = await patchOrderToApi(id, patch);
  const saved = data.order || data;
  ordersCache = readOrders().map((o) => (o.id === id ? saved : o));
  notifyOrdersUpdated();
  return data;
}

export async function updateOrderStatus(id, status, adminNote = "") {
  return updateOrder(id, {
    status,
    adminNote,
    statusUpdatedAt: new Date().toISOString(),
  });
}

export async function deleteOrder(id) {
  const res = await fetch(`${ORDERS_API}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete order");
  const data = await res.json();
  ordersCache = readOrders().filter((o) => o.id !== id);
  notifyOrdersUpdated();
  return data;
}

export async function deleteOrders(ids) {
  const deleted = [];
  for (const id of ids) {
    try {
      const result = await deleteOrder(id);
      deleted.push(result);
    } catch {
      /* continue with rest */
    }
  }
  return deleted;
}

export function subscribeOrdersUpdated(handler) {
  const onCustom = () => handler();
  window.addEventListener("orders-updated", onCustom);

  pollListenerCount += 1;
  if (pollListenerCount === 1) {
    startOrderPolling();
    runOrderPoll();
  }

  return () => {
    window.removeEventListener("orders-updated", onCustom);
    pollListenerCount -= 1;
    if (pollListenerCount <= 0) {
      pollListenerCount = 0;
      stopOrderPolling();
    }
  };
}
