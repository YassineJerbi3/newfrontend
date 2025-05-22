"use client";

import React, { useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

// Mirror your backend enum
const EmplacementType = {
  BUREAU: "BUREAU",
  CLASSE: "CLASSE",
};

export default function AddEmplacementPage() {
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";

  const [formData, setFormData] = useState({
    nom: "",
    type: EmplacementType.BUREAU,
    nombrePostes: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "nombrePostes" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API}/emplacements`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || "Erreur serveur");
      console.log("Créé :", payload);
      setFormData({ nom: "", type: EmplacementType.BUREAU, nombrePostes: 0 });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <DefaultLayout>
      <div className="flex justify-center px-4 py-10">
        <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
          {/* Header Gradient Bleu */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6">
            <h1 className="text-center text-3xl font-bold text-white">
              Ajouter un emplacement
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2"
          >
            {/* Nom */}
            <div className="col-span-1 md:col-span-2">
              <label
                htmlFor="nom"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Nom de l’emplacement
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Ex : Salle A101"
                required
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3
                  transition focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-200"
              />
            </div>

            {/* Type */}
            <div>
              <label
                htmlFor="type"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Type d’emplacement
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4
                  py-3 transition focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                <option value="">-- Sélectionner --</option>
                <option value={EmplacementType.BUREAU}>Bureau</option>
                <option value={EmplacementType.CLASSE}>Classe</option>
              </select>
              <div className="pointer-events-none absolute right-8 top-12">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
                </svg>
              </div>
            </div>

            {/* Nombre de postes */}
            <div>
              <label
                htmlFor="nombrePostes"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Nombre de postes
              </label>
              <input
                id="nombrePostes"
                name="nombrePostes"
                type="number"
                min={0}
                value={formData.nombrePostes}
                onChange={handleChange}
                placeholder="Ex : 12"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3
                  transition focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-200"
              />
            </div>

            {/* Erreur */}
            {error && (
              <div className="col-span-1 text-center font-semibold text-red-600 md:col-span-2">
                {error}
              </div>
            )}

            {/* Submit Button Gradient Bleu */}
            <div className="col-span-1 flex justify-center md:col-span-2">
              <button
                type="submit"
                className="w-full max-w-xs transform rounded-full bg-gradient-to-r
                  from-blue-600 to-blue-800 py-3 font-bold text-white shadow-lg
                  transition hover:scale-105 hover:from-blue-700 hover:to-blue-900"
              >
                Ajouter
              </button>
            </div>
          </form>
        </div>
      </div>
    </DefaultLayout>
  );
}
