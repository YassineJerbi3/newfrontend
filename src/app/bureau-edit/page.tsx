// src/app/bureaux/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { FaBuilding } from "react-icons/fa";

interface Emplacement {
  id: string;
  nom: string;
  type: string;
}

export default function BureauSelectionPage() {
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";
  const [bureaux, setBureaux] = useState<Emplacement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBureaux = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/emplacements/bureaux`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data: Emplacement[] = await res.json();
        setBureaux(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBureaux();
  }, [API]);

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white px-4 py-10">
        <h1 className="mb-6 text-center text-4xl font-extrabold text-indigo-800">
          Sélectionner un bureau
        </h1>

        {loading && (
          <p className="text-center text-lg text-gray-500">Chargement…</p>
        )}
        {error && (
          <p className="text-center text-lg text-red-600">Erreur : {error}</p>
        )}

        <div className="grid w-full max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {!loading && !error && bureaux.length === 0 && (
            <p className="col-span-full text-center text-lg text-gray-600">
              Aucun bureau disponible.
            </p>
          )}

          {bureaux.map((bureau) => (
            // Redirection vers la page d'édition au lieu de la page de détail
            <Link
              key={bureau.id}
              href={`/bureau-edit/${bureau.id}`}
              className="group relative flex flex-col items-center rounded-3xl border border-gray-200 bg-white p-8 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-indigo-500 hover:shadow-2xl"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 transition-colors duration-300 group-hover:bg-indigo-600">
                <FaBuilding
                  size={30}
                  className="text-indigo-600 group-hover:text-white"
                />
              </div>
              <h2 className="text-center text-2xl font-semibold text-gray-800 group-hover:text-indigo-700">
                {bureau.nom}
              </h2>
            </Link>
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
}
