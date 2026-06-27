import { useEffect, useState } from "react";
import { fetchCatalog, saveCategories } from "../services/catalogService";

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", arabicTitle: "", image: "" });
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchCatalog();
      setCategories(data.categories || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addCategory = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const next = [
      ...categories,
      {
        id: Date.now(),
        title: form.title.trim().toUpperCase(),
        arabicTitle: form.arabicTitle.trim(),
        image: form.image.trim(),
      },
    ];
    try {
      const data = await saveCategories(next);
      setCategories(data.categories || next);
      setForm({ title: "", arabicTitle: "", image: "" });
      setMessage("Category added.");
    } catch {
      setMessage("Could not save category.");
    }
  };

  const removeCategory = async (id) => {
    const next = categories.filter((c) => c.id !== id);
    await saveCategories(next);
    setCategories(next);
  };

  if (loading) {
    return <p className="text-center text-gray-muted">Loading categories...</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-navy">Categories</h1>
        <p className="text-[13px] text-gray-muted">Manage food categories for the menu</p>
      </div>

      {message && (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-[13px] font-semibold text-emerald-700">
          {message}
        </p>
      )}

      <form onSubmit={addCategory} className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-3 text-[14px] font-bold text-navy">Add category</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Title e.g. CHICKEN"
            className="rounded-xl border border-gray-border px-3 py-2.5 text-sm outline-none focus:border-orange"
            required
          />
          <input
            value={form.arabicTitle}
            onChange={(e) => setForm((f) => ({ ...f, arabicTitle: e.target.value }))}
            placeholder="Arabic title"
            className="rounded-xl border border-gray-border px-3 py-2.5 text-sm outline-none focus:border-orange"
          />
          <input
            value={form.image}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            placeholder="Image URL (optional)"
            className="rounded-xl border border-gray-border px-3 py-2.5 text-sm outline-none focus:border-orange"
          />
        </div>
        <button
          type="submit"
          className="mt-3 rounded-xl bg-orange px-5 py-2.5 text-[13px] font-bold text-white"
        >
          + Add Category
        </button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map((cat) => (
          <article key={cat.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-navy">{cat.title}</p>
                {cat.arabicTitle && (
                  <p className="text-[13px] text-gray-muted">{cat.arabicTitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeCategory(cat.id)}
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

export default CategoriesPage;
