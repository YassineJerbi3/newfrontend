"use client";

import React, { useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export default function AddEquipementPage() {
  const [formData, setFormData] = useState({
    type: "",
    marque: "",
    modele: "",
    numeroSerie: "",
    etat: "Neuf",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Equipment Data:", formData);
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-xl rounded bg-white p-6 shadow-lg">
        <h1 className="mb-4 text-xl font-bold">Ajouter Nouvel Équipement</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full rounded border p-2"
          >
            <option value="">Sélectionner le type d’équipement</option>
            <option value="Unité Centrale">Unité Centrale</option>
            <option value="Écran">Écran</option>
            <option value="Écran Interactif">Écran Interactif</option>
            <option value="Datashow">Datashow</option>
            <option value="Imprimante">Imprimante</option>
            <option value="Serveur">Serveur</option>
            <option value="Caméra de Surveillance">
              Caméra de Surveillance
            </option>
            <option value="Photocopieuse">Photocopieuse</option>
            <option value="TV">TV</option>
          </select>

          <input
            type="text"
            name="marque"
            value={formData.marque}
            onChange={handleChange}
            placeholder="Marque"
            required
            className="w-full rounded border p-2"
          />
          <input
            type="text"
            name="modele"
            value={formData.modele}
            onChange={handleChange}
            placeholder="Modèle"
            required
            className="w-full rounded border p-2"
          />
          <input
            type="text"
            name="numeroSerie"
            value={formData.numeroSerie}
            onChange={handleChange}
            placeholder="Numéro de Série"
            required
            className="w-full rounded border p-2"
          />

          <select
            name="etat"
            value={formData.etat}
            onChange={handleChange}
            required
            className="w-full rounded border p-2"
          >
            <option value="Neuf">Neuf</option>
            <option value="Occasion">Occasion</option>
            <option value="En Panne">En Panne</option>
          </select>

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
