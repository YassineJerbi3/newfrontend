"use client";

import React, { useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

// Local enum matching backend CreateEmplacementDto
const EmplacementType = {
  BUREAU: "BUREAU",
  CLASSE: "CLASSE",
};

// Local enum for equipment types matching backend EquipmentType
const EquipmentType = {
  IMPRIMANTE: "IMPRIMANTE",
  PHOTOCOPIEUSE: "PHOTOCOPIEUSE",
  ECRAN: "ECRAN",
  ECRAN_INTERACTIF: "ECRAN_INTERACTIF",
  UNITE_CENTRALE: "UNITE_CENTRALE",
  POSTE: "POSTE",
  SERVEUR: "SERVEUR",
  CAMERA_DE_SURVEILLANCE: "CAMERA_DE_SURVEILLANCE",
  TV: "TV",
};

export default function AddEmplacementPage() {
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";

  const [formData, setFormData] = useState({
    nom: "",
    type: EmplacementType.BUREAU,
    equipmentCounts: [{ equipmentType: EquipmentType.IMPRIMANTE, quantity: 1 }],
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index?: number,
    field?: "equipmentType" | "quantity",
  ) => {
    if (field != null && index != null) {
      const newCounts = [...formData.equipmentCounts];
      newCounts[index] = {
        ...newCounts[index],
        [field]:
          field === "quantity" ? parseInt(e.target.value) : e.target.value,
      };
      setFormData({ ...formData, equipmentCounts: newCounts });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const addCountRow = () => {
    setFormData({
      ...formData,
      equipmentCounts: [
        ...formData.equipmentCounts,
        { equipmentType: EquipmentType.IMPRIMANTE, quantity: 1 },
      ],
    });
  };

  const removeCountRow = (index: number) => {
    const newCounts = formData.equipmentCounts.filter((_, i) => i !== index);
    setFormData({ ...formData, equipmentCounts: newCounts });
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
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Erreur serveur");
      console.log("Emplacement créé", result);
      setFormData({
        nom: "",
        type: EmplacementType.BUREAU,
        equipmentCounts: [],
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const isBureau = formData.type === EmplacementType.BUREAU;

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
              required
              className="w-full rounded border p-2"
            >
              <option value={EmplacementType.BUREAU}>Bureau</option>
              <option value={EmplacementType.CLASSE}>Classe</option>
            </select>
          </label>

          {isBureau && (
            <div className="space-y-2">
              <h2 className="font-semibold">Quantités d'équipements</h2>
              {formData.equipmentCounts.map((row, idx) => (
                <div key={idx} className="flex space-x-2">
                  <select
                    value={row.equipmentType}
                    onChange={(e) => handleChange(e, idx, "equipmentType")}
                    className="flex-1 rounded border p-2"
                  >
                    {Object.values(EquipmentType).map((val) => (
                      <option key={val} value={val}>
                        {val}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={row.quantity}
                    onChange={(e) => handleChange(e, idx, "quantity")}
                    className="w-24 rounded border p-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeCountRow(idx)}
                    className="px-2"
                  >
                    🗑
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addCountRow}
                className="text-blue-600"
              >
                + Ajouter un type
              </button>
            </div>
          )}

          {error && <div className="text-red-600">{error}</div>}

          <button
            type="submit"
            className="w-full rounded bg-blue-600 p-2 text-white hover:bg-green-700"
          >
            Ajouter
          </button>
        </form>
      </div>
    </DefaultLayout>
  );
}
