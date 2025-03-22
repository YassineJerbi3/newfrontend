"use client";

import React, { useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export default function AddPlacementPage() {
  const [formData, setFormData] = useState({
    emplacement: "",
    poste: "",
    equipement: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Placement Data:", formData);
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-xl rounded bg-white p-6 shadow-lg">
        <h1 className="mb-4 text-xl font-bold">Ajouter Placement Équipement</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            name="emplacement"
            value={formData.emplacement}
            onChange={handleChange}
            required
            className="w-full rounded border p-2"
          >
            <option value="">Sélectionner un emplacement</option>
            <option value="Bureau">Bureau</option>
            <option value="Classe 1">Classe 1</option>
            <option value="Classe 2">Classe 2</option>
            <option value="Classe 3">Classe 3</option>
            <option value="Classe 4">Classe 4</option>
            <option value="Classe 5">Classe 5</option>
            <option value="Classe 6">Classe 6</option>
          </select>

          <input
            type="text"
            name="poste"
            value={formData.poste}
            onChange={handleChange}
            placeholder="Numéro de poste (pour les classes)"
            className="w-full rounded border p-2"
          />

          <select
            name="equipement"
            value={formData.equipement}
            onChange={handleChange}
            required
            className="w-full rounded border p-2"
          >
            <option value="">Sélectionner un équipement</option>
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

          <button
            type="submit"
            className="w-full rounded bg-green-600 p-2 text-white hover:bg-green-700"
          >
            Ajouter
          </button>
        </form>
      </div>
    </DefaultLayout>
  );
}
