"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string;
  name: string;
  model_number: string;
  category: string;
}

export function ProductPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("products")
        .select("id, name, model_number, category")
        .eq("active", true)
        .order("name");
      setProducts(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.model_number.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  const selectedProducts = products.filter((p) => selected.includes(p.id));

  return (
    <div className="space-y-2">
      {/* Selected pills */}
      {selectedProducts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedProducts.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1 text-xs text-white"
            >
              <span className="font-mono">{p.model_number || p.name}</span>
              <button
                type="button"
                onClick={() => toggle(p.id)}
                className="text-gray-400 hover:text-white ml-0.5"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search + dropdown */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name or model..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {loading ? (
        <p className="text-xs text-gray-400 py-2">Loading products...</p>
      ) : (
        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <p className="text-xs text-gray-400 px-3 py-3 text-center">No products found</p>
          ) : (
            filtered.map((p) => {
              const isSelected = selected.includes(p.id);
              return (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? "bg-blue-50/50" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(p.id)}
                    className="rounded border-gray-300 text-gray-900"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500 font-mono">{p.model_number}</div>
                  </div>
                  <span className="text-[10px] text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
                    {p.category}
                  </span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
