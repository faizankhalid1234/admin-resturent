import { Navigate } from "react-router-dom";
import { isAdminLoggedIn } from "../services/adminService";

function AdminRoute({ children }) {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default AdminRoute;
