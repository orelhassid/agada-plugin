import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type { Product, Package as Pkg, Settings } from "@/types";

export function useProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ items: Product[] }>("products");
      setItems(res.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upsert = async (data: Partial<Product>) => {
    const res = await apiFetch<{ items: Product[] }>("products", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setItems(res.items);
    return res.items;
  };

  const bulk = async (action: string, ids: number[]) => {
    const res = await apiFetch<{ items: Product[] }>("products/bulk", {
      method: "POST",
      body: JSON.stringify({ action, ids }),
    });
    setItems(res.items);
    return res.items;
  };

  return { items, loading, refresh, upsert, bulk };
}

export function usePackages() {
  const [items, setItems] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ items: Pkg[] }>("packages");
      setItems(res.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upsert = async (data: any) => {
    const res = await apiFetch<{ items: Pkg[] }>("packages", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setItems(res.items);
    return res.items;
  };

  const bulk = async (action: string, ids: number[]) => {
    const res = await apiFetch<{ items: Pkg[] }>("packages/bulk", {
      method: "POST",
      body: JSON.stringify({ action, ids }),
    });
    setItems(res.items);
    return res.items;
  };

  return { items, loading, refresh, upsert, bulk };
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<Settings>("settings");
      setSettings(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = async (data: Partial<Settings>) => {
    const res = await apiFetch<Settings>("settings", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setSettings(res);
    return res;
  };

  return { settings, loading, refresh, save };
}
