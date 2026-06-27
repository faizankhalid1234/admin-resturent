import { useEffect, useMemo, useState } from "react";
import { fetchCatalog, saveMenuItems } from "../services/catalogService";

function MenuItemsPage() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    price: "",
    categoryId: "",
    type: "menu",
  });
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchCatalog();
      setCategories(data.categories || []);
      setMenuItems(data.menuItems || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.title])),
    [categories]
  );

  const addItem = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price.trim()) return;
    const next = [
      ...menuItems,
      {
        id: `item-${Date.now()}`,
        title: form.title.trim(),
        price: form.price.includes("SAR") ? form.price.trim() : `${form.price.trim()} SAR`,
        categoryId: Number(form.categoryId) || categories[0]?.id || 1,
        type: form.type,
        image: "",
      },
    ];
    try {
      const data = await saveMenuItems(next);
      setMenuItems(data.menuItems || next);
      setForm({ title: "", price: "", categoryId: "", type: "menu" });
      setMessage("Menu item added.");
    } catch {
      setMessage("Could not save item.");
    }
  };

  const removeItem = async (id) => {
    const next = menuItems.filter((i) => i.id !== id);
    await saveMenuItems(next);
    setMenuItems(next);
  };

  if (loading) {
    return <p className="text-center text-gray-muted">Loading menu items...</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-navy">Menu Items</h1>
        <p className="text-[13px] text-gray-muted">All dishes and deals in the restaurant menu</p>
      </div>

      {message && (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-[13px] font-semibold text-emerald-700">
          {message}
        </p>
      )}

      <form onSubmit={addItem} className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-3 text-[14px] font-bold text-navy">Add menu item</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Item name"
            className="rounded-xl border border-gray-border px-3 py-2.5 text-sm outline-none focus:border-orange"
            required
          />
          <input
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            placeholder="Price e.g. 25.00"
            className="rounded-xl border border-gray-border px-3 py-2.5 text-sm outline-none focus:border-orange"
            required
          />
          <select
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            className="rounded-xl border border-gray-border px-3 py-2.5 text-sm outline-none focus:border-orange"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="rounded-xl border border-gray-border px-3 py-2.5 text-sm outline-none focus:border-orange"
          >
            <option value="menu">Menu</option>
            <option value="deal">Deal</option>
          </select>
        </div>
        <button
          type="submit"
          className="mt-3 rounded-xl bg-orange px-5 py-2.5 text-[13px] font-bold text-white"
        >
          + Add Item
        </button>
      </form>

      <div className="space-y-3">
        {menuItems.map((item) => (
          <article
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm"
          >
            <div>
              <p className="font-bold text-navy">{item.title}</p>
              <p className="text-[12px] text-gray-muted">
                {categoryMap[item.categoryId] || "Uncategorized"} · {item.type}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[15px] font-bold text-orange">{item.price}</span>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-[12px] font-semibold text-red-500"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default MenuItemsPage;
