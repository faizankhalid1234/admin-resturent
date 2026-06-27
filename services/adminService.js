const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "bk_admin_token";
const USER_KEY = "bk_admin_user";

export const DEFAULT_ADMIN = {
  email: "admin@bhandukhan.com",
  password: "admin123",
  name: "Admin",
};

function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function readAdminSession() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

function apiUrl(path) {
  return `${API_URL}${path}`;
}

async function api(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(apiUrl(path), { ...options, headers });
  } catch {
    throw new Error(
      "Backend server is not running. Open a terminal and run: cd backend → npm run dev"
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(apiUrl("/api/health"));
    return res.ok;
  } catch {
    return false;
  }
}

export async function signupAdmin({ name, email, password }) {
  const { token, user } = await api("/api/admin/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  saveSession(token, user);
  return user;
}

export async function loginAdmin({ email, password }) {
  const { token, user } = await api("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveSession(token, user);
  return user;
}

export async function logoutAdmin() {
  const token = localStorage.getItem(TOKEN_KEY);
  clearSession();
  if (token) {
    try {
      await api("/api/admin/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
  }
}

export function isAdminLoggedIn() {
  return Boolean(readAdminSession() && localStorage.getItem(TOKEN_KEY));
}

export function getAdminUser() {
  return readAdminSession();
}
