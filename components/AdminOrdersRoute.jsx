import AdminRoute from "./AdminRoute";
import AdminLayout from "./AdminLayout";
import OrdersPage from "../pages/OrdersPage";

export default function AdminOrdersRoute() {
  return (
    <AdminRoute>
      <AdminLayout>
        <OrdersPage />
      </AdminLayout>
    </AdminRoute>
  );
}
