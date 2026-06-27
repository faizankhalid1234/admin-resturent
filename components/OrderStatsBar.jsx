import { useEffect, useState, useMemo } from "react";
import { IoCashOutline, IoCloseCircleOutline, IoReceiptOutline } from "react-icons/io5";
import {
  ORDER_STATUS,
  readOrders,
  subscribeOrdersUpdated,
  bootstrapOrders,
} from "../services/orderService";
import { formatSAR } from "../utils/formatSAR";

const COUNTED_STATUSES = new Set([
  ORDER_STATUS.APPROVED,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.PAID,
]);

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function OrderStatsBar() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    bootstrapOrders().then(() => setOrders(readOrders()));
    return subscribeOrdersUpdated(() => setOrders(readOrders()));
  }, []);

  const countedOrders = useMemo(
    () => orders.filter((o) => COUNTED_STATUSES.has(normalizeStatus(o.status))),
    [orders]
  );

  const totalValue = countedOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const paidValue = orders
    .filter((o) => normalizeStatus(o.status) === ORDER_STATUS.PAID)
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const rejectedCount = orders.filter((o) => normalizeStatus(o.status) === ORDER_STATUS.REJECTED).length;
  const pendingCount = orders.filter((o) => normalizeStatus(o.status) === ORDER_STATUS.PENDING).length;

  return (
    <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-2xl bg-gradient-to-br from-orange to-orange-dark p-4 text-white shadow-md">
        <div className="flex items-center gap-2 text-white/85">
          <IoCashOutline className="h-5 w-5" />
          <span className="text-[11px] font-semibold uppercase tracking-wide">Total Sales</span>
        </div>
        <p className="mt-2 text-[22px] font-bold leading-tight">{formatSAR(totalValue)}</p>
        <p className="mt-0.5 text-[11px] text-white/80">
          {countedOrders.length} approved / processing / paid
        </p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-border/80">
        <div className="flex items-center gap-2 text-gray-muted">
          <IoCashOutline className="h-5 w-5 text-emerald-600" />
          <span className="text-[11px] font-semibold uppercase tracking-wide">Paid</span>
        </div>
        <p className="mt-2 text-[22px] font-bold text-emerald-600">{formatSAR(paidValue)}</p>
        <p className="mt-0.5 text-[11px] text-gray-muted">Payment received</p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-border/80">
        <div className="flex items-center gap-2 text-gray-muted">
          <IoCloseCircleOutline className="h-5 w-5 text-red-500" />
          <span className="text-[11px] font-semibold uppercase tracking-wide">Rejected</span>
        </div>
        <p className="mt-2 text-[22px] font-bold text-red-600">{rejectedCount}</p>
        <p className="mt-0.5 text-[11px] text-gray-muted">Not counted in sales</p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-border/80">
        <div className="flex items-center gap-2 text-gray-muted">
          <IoReceiptOutline className="h-5 w-5 text-amber-600" />
          <span className="text-[11px] font-semibold uppercase tracking-wide">Pending</span>
        </div>
        <p className="mt-2 text-[22px] font-bold text-amber-600">{pendingCount}</p>
        <p className="mt-0.5 text-[11px] text-gray-muted">Awaiting approval</p>
      </div>
    </div>
  );
}

export default OrderStatsBar;
