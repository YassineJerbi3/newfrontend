"use client";

import React, { useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

// Mirror your backend enums
const UtilisateurType = {
  ENSEIGNANT: "ENSEIGNANT",
  ETUDIANT: "ETUDIANT",
  ADMINISTRATIF: "ADMINISTRATIF",
};
const EquipementEtat = {
  FONCTIONNEL: "FONCTIONNEL",
  EN_PANNE: "EN_PANNE",
};

const MaintenanceType = {
  MENSUELLE: "MENSUELLE",
  ANNUELLE: "ANNUELLE",
  HEBDOMADAIRE: "HEBDOMADAIRE",
  SEMESTRIELLE: "SEMESTRIELLE",
  TRIMESTRIELLE: "TRIMESTRIELLE",
};

export default function AddEquipementPage() {
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";

  const [emplacements, setEmplacements] = useState<
    { id: string; nom: string; type: string }[]
  >([]);
  const [formData, setFormData] = useState({
    familleMI: "",
    designation: "",
    code: "",
    numeroSerie: "",
    codeInventaire: "",
    emplacementId: "",
    utilisateur: UtilisateurType.ENSEIGNANT,
    etat: EquipementEtat.FONCTIONNEL,
    dateMiseService: new Date().toISOString().substr(0, 10), // YYYY-MM-DD
    maintenanceRecords: [
      { type: MaintenanceType.MENSUELLE, description: "" },
    ] as { type: string; description: string }[],
  });
  const [error, setError] = useState<string | null>(null);

  // Load emplacements for the select dropdown
  useEffect(() => {
    fetch(`${API}/emplacements`)
      .then((res) => res.json())
      .then((data) => setEmplacements(data.items || []))
      .catch((err) => console.error("Failed to load emplacements", err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMaintenanceChange = (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const mr = [...formData.maintenanceRecords];
    mr[idx] = { ...mr[idx], [e.target.name]: e.target.value };
    setFormData({ ...formData, maintenanceRecords: mr });
  };

  const addMaintenanceRow = () => {
    setFormData({
      ...formData,
      maintenanceRecords: [
        ...formData.maintenanceRecords,
        { type: MaintenanceType.MENSUELLE, description: "" },
      ],
    });
  };

  const removeMaintenanceRow = (idx: number) => {
    const mr = formData.maintenanceRecords.filter((_, i) => i !== idx);
    setFormData({ ...formData, maintenanceRecords: mr });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API}/equipements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Erreur serveur");
      console.log("Created equipment:", result);
      // reset
      setFormData({
        familleMI: "",
        designation: "",
        code: "",
        numeroSerie: "",
        codeInventaire: "",
        emplacementId: "",
        utilisateur: UtilisateurType.ENSEIGNANT,
        etat: EquipementEtat.FONCTIONNEL,
        dateMiseService: new Date().toISOString().substr(0, 10),
        maintenanceRecords: [
          { type: MaintenanceType.MENSUELLE, description: "" },
        ],
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-xl rounded bg-white p-6 shadow-lg">
        <h1 className="mb-4 text-xl font-bold">Ajouter Nouvel Équipement</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/** Emplacement */}
          <label className="block">
            Emplacement
            <select
              name="emplacementId"
              value={formData.emplacementId}
              onChange={handleChange}
              required
              className="w-full rounded border p-2"
            >
              <option value="">Sélectionner un emplacement</option>
              {emplacements.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nom} ({e.type})
                </option>
              ))}
            </select>
          </label>

          {/** Equipment fields */}
          <label className="block">
            Famille MI
            <input
              name="familleMI"
              type="text"
              value={formData.familleMI}
              onChange={handleChange}
              required
              className="w-full rounded border p-2"
            />
          </label>

          <label className="block">
            Désignation
            <input
              name="designation"
              type="text"
              value={formData.designation}
              onChange={handleChange}
              required
              className="w-full rounded border p-2"
            />
          </label>

          <label className="block">
            Code
            <input
              name="code"
              type="text"
              value={formData.code}
              onChange={handleChange}
              required
              className="w-full rounded border p-2"
            />
          </label>

          <label className="block">
            Numéro de série
            <input
              name="numeroSerie"
              type="text"
              value={formData.numeroSerie}
              onChange={handleChange}
              required
              className="w-full rounded border p-2"
            />
          </label>

          <label className="block">
            Code inventaire
            <input
              name="codeInventaire"
              type="text"
              value={formData.codeInventaire}
              onChange={handleChange}
              required
              className="w-full rounded border p-2"
            />
          </label>

          <label className="block">
            Utilisateur
            <select
              name="utilisateur"
              value={formData.utilisateur}
              onChange={handleChange}
              className="w-full rounded border p-2"
            >
              {Object.entries(UtilisateurType).map(([k, v]) => (
                <option key={k} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            État
            <select
              name="etat"
              value={formData.etat}
              onChange={handleChange}
              className="w-full rounded border p-2"
            >
              {Object.entries(EquipementEtat).map(([k, v]) => (
                <option key={k} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            Date de mise en service
            <input
              name="dateMiseService"
              type="date"
              value={formData.dateMiseService}
              onChange={handleChange}
              required
              className="w-full rounded border p-2"
            />
          </label>

          {/** Maintenance preventive section */}
          <div className="space-y-2 border-t pt-4">
            <h2 className="text-lg font-semibold">Maintenance Préventive</h2>
            {formData.maintenanceRecords.map((m, i) => (
              <div key={i} className="flex gap-2">
                <select
                  name="type"
                  value={m.type}
                  onChange={(e) => handleMaintenanceChange(i, e)}
                  className="flex-1 rounded border p-2"
                >
                  {Object.entries(MaintenanceType).map(([k, v]) => (
                    <option key={k} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <input
                  name="description"
                  value={m.description}
                  onChange={(e) => handleMaintenanceChange(i, e)}
                  placeholder="Description"
                  className="flex-2 rounded border p-2"
                />
                <button
                  type="button"
                  onClick={() => removeMaintenanceRow(i)}
                  className="text-red-600"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addMaintenanceRow}
              className="text-blue-600"
            >
              + Ajouter maintenance
            </button>
          </div>

          {error && <div className="text-red-600">{error}</div>}

          <button
            type="submit"
            className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
          >
            Ajouter l’équipement
          </button>
        </form>
      </div>
    </DefaultLayout>
  );
}
