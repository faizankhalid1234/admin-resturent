import { useState, useEffect } from "react";
import { useSiteAdmin } from "../hooks/useSiteAdmin";
import { AdminListHeader } from "../components/AdminItemEditor";

function SettingsPage() {
  const { settings, saveSettings, resetAll } = useSiteAdmin();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    saveSettings({
      ...form,
      deliveryFee: Number(form.deliveryFee) || 0,
      copyrightYear: Number(form.copyrightYear) || 2026,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputClass =
    "w-full rounded-xl border border-gray-border bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-orange";

  return (
    <div>
      <AdminListHeader
        title="Website Settings"
        subtitle="Restaurant name, contact info, delivery fee — updates live on the website."
      />

      <form
        onSubmit={handleSubmit}
        className="max-w-[560px] space-y-4 rounded-2xl border border-gray-border bg-white p-4 sm:p-5"
      >
        <div>
          <label className="mb-1 block text-[12px] font-medium text-gray-muted">Restaurant name</label>
          <input value={form.restaurantName} onChange={set("restaurantName")} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-gray-muted">Contact person</label>
          <input value={form.contactName} onChange={set("contactName")} className={inputClass} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-gray-muted">Phone</label>
            <input value={form.phone} onChange={set("phone")} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-gray-muted">WhatsApp (with country code)</label>
            <input value={form.whatsapp} onChange={set("whatsapp")} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-gray-muted">Email</label>
          <input type="email" value={form.email} onChange={set("email")} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-gray-muted">Address</label>
          <textarea value={form.address} onChange={set("address")} rows={2} className={`${inputClass} resize-none`} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-gray-muted">Delivery fee (SAR)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={form.deliveryFee}
              onChange={set("deliveryFee")}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-gray-muted">Copyright year</label>
            <input
              type="number"
              value={form.copyrightYear}
              onChange={set("copyrightYear")}
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-orange py-3 text-[14px] font-bold text-white"
        >
          Save settings
        </button>
        {saved && (
          <p className="text-center text-[13px] font-semibold text-green-600">Settings saved to website!</p>
        )}
      </form>

      <div className="mt-6 max-w-[560px] rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-[13px] font-bold text-red-700">Reset custom content</p>
        <p className="mt-1 text-[12px] text-red-600">
          Clears admin edits for menu, deals & categories. Website will use API data again.
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm("Reset all admin content changes? Settings will also reset.")) resetAll();
          }}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-[12px] font-bold text-white"
        >
          Reset all content
        </button>
      </div>
    </div>
  );
}

export default SettingsPage;
