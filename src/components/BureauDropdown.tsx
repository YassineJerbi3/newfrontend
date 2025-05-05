"use client";

import React, { useState, useEffect, useRef } from "react";

interface BureauDropdownProps {
  options: string[];
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function BureauDropdown({
  options,
  value,
  onChange,
  placeholder,
}: BureauDropdownProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // filter only strings
  const filtered = options.filter(
    (name) =>
      typeof name === "string" &&
      name.toLowerCase().includes(filter.toLowerCase()),
  );

  // group & sort filtered options
  const grouped = filtered
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .reduce((acc: Record<string, string[]>, name) => {
      const L = name[0].toUpperCase();
      if (!acc[L]) acc[L] = [];
      acc[L].push(name);
      return acc;
    }, {});

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded border bg-white px-3 py-2 text-left hover:bg-gray-50"
      >
        {value || placeholder || "Sélectionner un bureau (optionnel)"}
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full rounded border bg-white shadow-lg">
          {/* search input */}
          <input
            type="text"
            placeholder="Rechercher…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full border-b px-2 py-1 focus:outline-none"
          />

          <div className="max-h-48 overflow-y-auto">
            {/* “Aucun” choice */}
            <div
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="cursor-pointer px-2 py-1 hover:bg-blue-100"
            >
              -- Aucun --
            </div>

            {Object.keys(grouped)
              .sort()
              .map((letter) => (
                <div key={letter}>
                  <div className="sticky top-0 bg-gray-100 px-2 py-1 font-bold">
                    {letter}
                  </div>
                  {grouped[letter].map((name) => (
                    <div
                      key={name}
                      onClick={() => {
                        onChange(name);
                        setOpen(false);
                      }}
                      className="cursor-pointer px-2 py-1 hover:bg-blue-100"
                    >
                      {name}
                    </div>
                  ))}
                </div>
              ))}

            {Object.keys(grouped).length === 0 && (
              <div className="px-2 py-2 text-sm text-gray-500">
                Aucun résultat
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
