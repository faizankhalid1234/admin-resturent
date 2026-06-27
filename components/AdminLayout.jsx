import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  IoLogOutOutline,
  IoReceiptOutline,
  IoGridOutline,
  IoFastFoodOutline,
  IoMenu,
} from "react-icons/io5";
import { useEffect, useState } from "react";
import BrandIcon from "./BrandIcon";
import NewOrderAlert from "./NewOrderAlert";
import OrderStatsBar from "./OrderStatsBar";
import { logoutAdmin, getAdminUser } from "../services/adminService";

const navItems = [
  { to: "/orders", label: "Orders", icon: IoReceiptOutline },
  { to: "/categories", label: "Categories", icon: IoGridOutline },
  { to: "/items", label: "Menu Items", icon: IoFastFoodOutline },
];

function AdminLayout() {
  const navigate = useNavigate();
  const user = getAdminUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [orderPanelOpen, setOrderPanelOpen] = useState(false);

  useEffect(() => {
    const onPanel = (e) => setOrderPanelOpen(Boolean(e.detail?.open));
    window.addEventListener("admin-order-panel", onPanel);
    return () => window.removeEventListener("admin-order-panel", onPanel);
  }, []);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition ${
      isActive
        ? "bg-orange text-white shadow-md"
        : "text-white/80 hover:bg-white/10 hover:text-white"
    }`;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <BrandIcon size={44} className="rounded-xl ring-2 ring-white/20" />
        <div>
          <p className="text-[15px] font-bold text-white">Bhandu Khan</p>
          <p className="text-[11px] text-white/65">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass} onClick={() => setMobileOpen(false)}>
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <p className="mb-2 truncate px-2 text-[12px] text-white/70">Hi, {user?.name || "Staff"}</p>
        <button
          type="button"
          onClick={() => {
            logoutAdmin();
            navigate("/login", { replace: true });
          }}
          className="flex w-full items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-[13px] font-semibold text-white transition hover:bg-white/15"
        >
          <IoLogOutOutline className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <NewOrderAlert />

      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 bg-gradient-to-b from-[#1a2340] to-[#243352] shadow-xl lg:block">
          {sidebar}
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            />
            <aside className="relative h-full w-64 bg-gradient-to-b from-[#1a2340] to-[#243352] shadow-xl">
              {sidebar}
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-gray-border/80 bg-white px-4 py-3 shadow-sm lg:px-6">
            <button
              type="button"
              className="rounded-lg p-2 text-navy lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <IoMenu className="h-6 w-6" />
            </button>
            <p className="text-[15px] font-bold text-navy lg:text-[17px]">Restaurant Dashboard</p>
            <div className="w-10 lg:hidden" />
          </header>

          <main
            className={`flex-1 p-4 transition-[padding] sm:p-6 ${
              orderPanelOpen ? "lg:pr-[440px]" : ""
            }`}
          >
            <div className="mx-auto max-w-5xl">
              <OrderStatsBar />
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
