// src/app/[...]/AddEmplacementPage.tsx

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
      <div className="mx-auto max-w-xl rounded bg-white p-6 shadow-lg">
        <h1 className="mb-4 text-xl font-bold">Ajouter Emplacement</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            Nom
            <input
              name="nom"
              type="text"
              value={formData.nom}
              onChange={handleChange}
              required
              className="w-full rounded border p-2"
            />
          </label>

          <label className="block">
            Type
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded border p-2"
              required
            >
              <option value={EmplacementType.BUREAU}>Bureau</option>
              <option value={EmplacementType.CLASSE}>Classe</option>
            </select>
          </label>

          <label className="block">
            Nombre de postes
            <input
              name="nombrePostes"
              type="number"
              min={0}
              value={formData.nombrePostes}
              onChange={handleChange}
              className="w-full rounded border p-2"
            />
          </label>

          {error && <div className="text-red-600">{error}</div>}

          <button
            type="submit"
            className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
          >
            Ajouter
          </button>
        </form>
      </div>
    </DefaultLayout>
  );
}
