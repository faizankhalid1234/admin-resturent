import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { unlockOrderAlertAudio, startPendingOrderAlert } from "./utils/playOrderAlert";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";

const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminSignup = lazy(() => import("./pages/AdminSignup"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const MenuItemsPage = lazy(() => import("./pages/MenuItemsPage"));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a2340]">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-orange/20 border-t-orange" />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const unlock = async () => {
      const ok = await unlockOrderAlertAudio();
      if (ok) await startPendingOrderAlert();
    };
    window.addEventListener("click", unlock);
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock, { passive: true });
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/signup" element={<AdminSignup />} />
          <Route
            path="/"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/orders" replace />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="items" element={<MenuItemsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
