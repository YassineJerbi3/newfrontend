// src/app/bureaux/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { FaBuilding } from "react-icons/fa";

// TypeScript type matching backend Emplacement entity
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
    async function fetchBureaux() {
      try {
        const res = await fetch(`${API}/emplacements/bureaux`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data: Emplacement[] = await res.json();
        setBureaux(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBureaux();
  }, []);

  return (
    <DefaultLayout>
      <div className="flex min-h-screen flex-col items-center justify-center bg-white">
        <h1 className="mb-8 text-4xl font-extrabold text-gray-800">
          Sélectionnez le bureau
        </h1>

        {loading && <p>Chargement des bureaux...</p>}
        {error && <p className="text-red-600">Erreur: {error}</p>}

        <div className="flex flex-wrap justify-center gap-6">
          {!loading && !error && bureaux.length === 0 && (
            <p>Aucun bureau disponible.</p>
          )}

          {!loading &&
            bureaux.map((bureau) => (
              <Link
                key={bureau.id}
                href={`/bureaux/${bureau.id}`}
                className="flex h-20 w-64 items-center justify-center bg-gray-200 shadow-md transition-colors duration-300 hover:bg-gray-300"
              >
                <FaBuilding className="mr-4 text-gray-700" size={30} />
                <span className="text-2xl font-bold text-gray-800">
                  {bureau.nom}
                </span>
              </Link>
            ))}
        </div>
      </div>
    </DefaultLayout>
  );
}
