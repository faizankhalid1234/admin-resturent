const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export async function fetchCatalog() {
  const res = await fetch(`${API_URL}/api/catalog`);
  if (!res.ok) throw new Error("Failed to load catalog");
  return res.json();
}

export async function saveCategories(categories) {
  const res = await fetch(`${API_URL}/api/catalog/categories`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categories),
  });
  if (!res.ok) throw new Error("Failed to save categories");
  return res.json();
}

export async function saveMenuItems(menuItems) {
  const res = await fetch(`${API_URL}/api/catalog/items`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(menuItems),
  });
  if (!res.ok) throw new Error("Failed to save items");
  return res.json();
}
