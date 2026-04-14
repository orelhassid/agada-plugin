declare global {
  interface Window {
    agadaAdminDashboard: {
      restUrl: string;
      restNonce: string;
      categories: Record<string, unknown>;
    };
  }
}

const config = window.agadaAdminDashboard ?? {
  restUrl: "/wp-json/agada/v1/",
  restNonce: "",
  categories: {},
};

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = config.restUrl + path;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-WP-Nonce": config.restNonce,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function getCategories() {
  return config.categories;
}
