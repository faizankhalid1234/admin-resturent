import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { IoLockClosedOutline, IoMailOutline } from "react-icons/io5";
import AdminAuthLayout from "../components/AdminAuthLayout";
import { loginAdmin, isAdminLoggedIn, DEFAULT_ADMIN, checkBackendHealth } from "../services/adminService";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEFAULT_ADMIN.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [backendDown, setBackendDown] = useState(false);

  useEffect(() => {
    if (isAdminLoggedIn()) navigate("/orders", { replace: true });
    checkBackendHealth().then((ok) => setBackendDown(!ok));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginAdmin({ email, password });
      navigate("/orders", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-border bg-[#fafbfc] py-3 pl-10 pr-4 text-sm text-navy outline-none transition focus:border-orange focus:bg-white focus:ring-2 focus:ring-orange/20";

  return (
    <AdminAuthLayout
      title="Login"
      subtitle="Manage incoming orders"
      footer={
        <>
          <p>
            New staff?{" "}
            <Link to="/signup" className="font-bold text-white underline">
              Sign up
            </Link>
          </p>
          <p className="mt-3 text-[12px] text-white/60">
            Default: {DEFAULT_ADMIN.email} / {DEFAULT_ADMIN.password}
          </p>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {backendDown && (
          <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-[12px] font-semibold text-amber-800">
            Backend is off. Run in terminal: <code className="font-mono">cd backend</code> then{" "}
            <code className="font-mono">npm run dev</code>
          </p>
        )}
        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2.5 text-[13px] font-semibold text-red-600">
            {error}
          </p>
        )}

        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-gray-muted">Email</label>
          <div className="relative">
            <IoMailOutline className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-gray-muted">Password</label>
          <div className="relative">
            <IoLockClosedOutline className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-muted" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-orange to-orange-dark py-3.5 text-[15px] font-bold text-white shadow-[0_4px_16px_rgba(249,115,22,0.4)] transition hover:opacity-95 disabled:opacity-60"
        >
          {loading ? "Please wait..." : "Login →"}
        </button>
      </form>
    </AdminAuthLayout>
  );
}

export default AdminLogin;
