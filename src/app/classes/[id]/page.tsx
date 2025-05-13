// src/app/classes/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { FaDesktop } from "react-icons/fa";

interface Poste {
  id: string;
  numero: number;
  details: string;
}

interface EmplacementDetail {
  id: string;
  nom: string;
  type: string;
  postes: Poste[];
}

export default function ClasseDetailPage() {
  const pathname = usePathname();
  const id = pathname.split("/").pop();
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";

  const [emplacement, setEmplacement] = useState<EmplacementDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Poste | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/emplacements/${id}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data: EmplacementDetail) => setEmplacement(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-5xl px-4 py-8">
        {loading && <p className="text-center">Chargement...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {emplacement && (
          <>
            <h1 className="mb-6 text-3xl font-bold text-gray-800">
              {emplacement.nom} — Postes
            </h1>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {emplacement.postes.map((poste) => (
                <div
                  key={poste.id}
                  onClick={() => setSelected(poste)}
                  className="flex cursor-pointer flex-col items-center rounded-2xl bg-white p-6 shadow-md transition-transform hover:scale-105 hover:shadow-xl"
                >
                  <FaDesktop size={48} className="mb-4 text-gray-600" />
                  <span className="text-xl font-semibold text-gray-800">
                    Poste {poste.numero}
                  </span>
                </div>
              ))}
            </div>

            {/* Modal */}
            {selected && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setSelected(null)}
                />
                <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
                  <button
                    onClick={() => setSelected(null)}
                    className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-800"
                  >
                    &times;
                  </button>
                  <h2 className="mb-4 text-2xl font-bold">
                    Poste {selected.numero}
                  </h2>
                  <pre className="mb-6 whitespace-pre-wrap text-gray-700">
                    {selected.details}
                  </pre>
                  <button
                    onClick={() => setSelected(null)}
                    className="mt-2 w-full rounded-lg bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DefaultLayout>
  );
}
