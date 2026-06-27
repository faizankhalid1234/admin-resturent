import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { IoLockClosedOutline, IoMailOutline, IoPersonOutline } from "react-icons/io5";
import AdminAuthLayout from "../components/AdminAuthLayout";
import { signupAdmin, isAdminLoggedIn, checkBackendHealth } from "../services/adminService";

function AdminSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [backendDown, setBackendDown] = useState(false);

  useEffect(() => {
    if (isAdminLoggedIn()) navigate("/orders", { replace: true });
    checkBackendHealth().then((ok) => setBackendDown(!ok));
  }, [navigate]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const inputClass =
    "w-full rounded-xl border border-gray-border bg-[#fafbfc] py-3 pl-10 pr-4 text-sm text-navy outline-none transition focus:border-orange focus:bg-white focus:ring-2 focus:ring-orange/20";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await signupAdmin(form);
      navigate("/orders", { replace: true });
    } catch (err) {
      setError(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthLayout
      title="Sign Up"
      subtitle="Create your staff account"
      footer={
        <p>
          Have account?{" "}
          <Link to="/login" className="font-bold text-white underline">
            Login
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {backendDown && (
          <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-[12px] font-semibold text-amber-800">
            Backend is off. Run: <code className="font-mono">cd backend</code> →{" "}
            <code className="font-mono">npm run dev</code>
          </p>
        )}
        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2.5 text-[13px] font-semibold text-red-600">
            {error}
          </p>
        )}

        {[
          { field: "name", icon: IoPersonOutline, label: "Name", type: "text" },
          { field: "email", icon: IoMailOutline, label: "Email", type: "email" },
          { field: "password", icon: IoLockClosedOutline, label: "Password", type: "password" },
          { field: "confirm", icon: IoLockClosedOutline, label: "Confirm", type: "password" },
        ].map(({ field, icon: Icon, label, type }) => (
          <div key={field}>
            <label className="mb-1 block text-[12px] font-semibold text-gray-muted">{label}</label>
            <div className="relative">
              <Icon className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-muted" />
              <input
                type={type}
                value={form[field]}
                onChange={set(field)}
                required
                minLength={field.includes("password") ? 6 : undefined}
                className={inputClass}
              />
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-xl bg-gradient-to-r from-orange to-orange-dark py-3.5 text-[15px] font-bold text-white shadow-[0_4px_16px_rgba(249,115,22,0.4)] disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
    </AdminAuthLayout>
  );
}

export default AdminSignup;
