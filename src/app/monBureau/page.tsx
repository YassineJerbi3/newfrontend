"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useState, useEffect } from "react";

interface Equipement {
  id: string;
  designation: string;
  equipmentType: string;
}

interface MineResponse {
  emplacement?: { id: string; nom: string };
  equipements: Equipement[];
  message?: string;
}

const imageMap: Record<string, string> = {
  IMPRIMANTE: "/images/devices/printer.png",
  PHOTOCOPIEUSE: "/images/devices/photo.png",
  ECRAN: "/images/devices/ecran.png",
  "ECRAN INTERACTIF": "/images/devices/ecraninteractif.png",
  "UNITE CENTRALE": "/images/devices/unite-centrale.png",
  SERVEUR: "/images/devices/serveur.png",
  "CAMERA DE SURVEILLANCE": "/images/devices/camer.png",
  TV: "/images/devices/tv.png",
};

export default function VotreBureauPage() {
  const [data, setData] = useState<MineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Equipement | null>(null);

  useEffect(() => {
    fetch("http://localhost:2000/equipements/mine", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then((json: MineResponse) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DefaultLayout>
      {/* Header */}
      <div className="rounded-b-3xl bg-gradient-to-r from-blue-600 to-blue-400 p-6 text-white">
        <h1 className="text-4xl font-bold">
          Votre Bureau{data?.emplacement && ` : ${data.emplacement.nom}`}
        </h1>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">Erreur : {error}</div>
        ) : data?.message ? (
          <div className="p-6 text-center text-gray-700">{data.message}</div>
        ) : (
          <div className="grid grid-cols-2 gap-12 sm:grid-cols-3 lg:grid-cols-4">
            {data.equipements.map((eq) => (
              <button
                key={eq.id}
                onClick={() => setSelected(eq)}
                className="group focus:outline-none"
                title={eq.designation}
              >
                <img
                  src={imageMap[eq.equipmentType]}
                  alt={eq.equipmentType}
                  className="h-32 w-32 object-contain transition-transform hover:scale-110"
                />
                <span className="mt-2 block text-center text-sm opacity-0 transition-opacity group-hover:opacity-100">
                  {eq.equipmentType}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-80 rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-2xl font-semibold">
              {selected.designation}
            </h3>
            <button
              onClick={() => {
                /* Déclarer une intervention */
              }}
              className="mb-2 w-full rounded-lg bg-red-600 py-2 text-white transition hover:bg-red-700"
            >
              Déclarer une intervention
            </button>
            <button
              onClick={() => setSelected(null)}
              className="w-full rounded-lg bg-gray-200 py-2 text-gray-800 transition hover:bg-gray-300"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
}
