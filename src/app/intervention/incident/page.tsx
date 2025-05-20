"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useState, useEffect } from "react";

interface Emplacement {
  id: string;
  nom: string;
}

interface Equipement {
  id: string;
  familleMI: string;
  equipmentType: string;
  numeroSerie: string;
}

interface User {
  id: string;
  nom: string;
  prenom: string;
  fonction: string;
  direction: string;
}

export default function DemandeInterventionForm() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    fonction: "",
    direction: "",
    emplacementId: "",
    typeObjet: "", // ← on envoie le type d’équipement ici
    equipementId: "",
    priorite: "",
    etat: "",
    description: "",
    pieceJointe: null as File | null,
    echeance: "",
  });
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );

  const prioriteOptions = [
    { value: "URGENT", label: "Urgent" },
    { value: "NORMALE", label: "Normale" },
    { value: "BASSE", label: "Basse" },
  ];
  const etatOptions = [
    { value: "EN_ARRET", label: "En arrêt" },
    { value: "EN_MARCHE", label: "En marche" },
  ];

  const [emplacements, setEmplacements] = useState<Emplacement[]>([]);
  const [allEquipements, setAllEquipements] = useState<Equipement[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);
  const [filteredEquipements, setFilteredEquipements] = useState<Equipement[]>(
    [],
  );
  const [selectedEquipement, setSelectedEquipement] =
    useState<Equipement | null>(null);

  // 1) charger user courant
  useEffect(() => {
    fetch("http://localhost:2000/users/me", { credentials: "include" })
      .then((r) => r.json())
      .then((u: User) =>
        setFormData((f) => ({
          ...f,
          nom: u.nom,
          prenom: u.prenom,
          fonction: u.fonction,
          direction: u.direction,
        })),
      )
      .catch(console.error);
  }, []);

  // 2) charger emplacements
  useEffect(() => {
    fetch("http://localhost:2000/emplacements", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { items: Emplacement[] }) => setEmplacements(data.items))
      .catch(console.error);
  }, []);

  // 3) charger tous les équipements de l’emplacement sélectionné
  useEffect(() => {
    if (!formData.emplacementId) {
      setAllEquipements([]);
      setEquipmentTypes([]);
      setFormData((f) => ({ ...f, typeObjet: "", equipementId: "" }));
      setFilteredEquipements([]);
      setSelectedEquipement(null);
      return;
    }
    fetch(
      `http://localhost:2000/equipements?emplacementId=${formData.emplacementId}`,
      { credentials: "include" },
    )
      .then((r) => r.json())
      .then((data) => {
        const list: Equipement[] = Array.isArray(data) ? data : data.items;
        setAllEquipements(list);
        // extraire les types
        const types = Array.from(new Set(list.map((eq) => eq.equipmentType)));
        setEquipmentTypes(types);
        // réinitialiser sélection
        setFormData((f) => ({
          ...f,
          typeObjet: "",
          equipementId: "",
        }));
        setFilteredEquipements([]);
        setSelectedEquipement(null);
      })
      .catch(console.error);
  }, [formData.emplacementId]);

  // 4) filtrer les équipements quand on choisit un type
  useEffect(() => {
    if (!formData.typeObjet) {
      setFilteredEquipements([]);
      setFormData((f) => ({ ...f, equipementId: "" }));
      setSelectedEquipement(null);
      return;
    }
    const filtered = allEquipements.filter(
      (eq) => eq.equipmentType === formData.typeObjet,
    );
    setFilteredEquipements(filtered);
    setFormData((f) => ({ ...f, equipementId: "" }));
    setSelectedEquipement(null);
  }, [formData.typeObjet, allEquipements]);

  // simuler upload
  const simulateUpload = (file: File) => {
    let prog = 0;
    const iv = setInterval(() => {
      prog = Math.min(100, prog + Math.floor(Math.random() * 10) + 5);
      setUploadProgress((p) => ({ ...p, [file.name]: prog }));
      if (prog >= 100) clearInterval(iv);
    }, 300);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, files } = e.target as any;

    if (name === "pieceJointe" && files?.[0]) {
      const f: File = files[0];
      simulateUpload(f);
      setFormData((f) => ({ ...f, pieceJointe: f }));
      return;
    }

    // sélectionner un équipement complet
    if (name === "equipementId") {
      const eq = filteredEquipements.find((e) => e.id === value) || null;
      setSelectedEquipement(eq);
    }

    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (v != null) payload.append(k, v as any);
    });
    fetch("http://localhost:2000/incidents", {
      method: "POST",
      credentials: "include",
      body: payload,
    })
      .then(() => {
        setFormData((f) => ({
          nom: f.nom,
          prenom: f.prenom,
          fonction: f.fonction,
          direction: f.direction,
          emplacementId: "",
          typeObjet: "",
          equipementId: "",
          priorite: "",
          etat: "",
          description: "",
          pieceJointe: null,
          echeance: "",
        }));
        setUploadProgress({});
        setSelectedEquipement(null);
      })
      .catch(console.error);
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="mb-8 text-center text-3xl font-bold">
          Demande d’Intervention
        </h1>
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-md border border-gray-300 bg-white p-6 shadow-sm"
        >
          {/* Identification (readonly) */}
          <div className="grid grid-cols-2 gap-4">
            {["nom", "prenom", "fonction", "direction"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-bold uppercase text-gray-900">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type="text"
                  name={field}
                  value={(formData as any)[field]}
                  readOnly
                  className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm"
                />
              </div>
            ))}
          </div>

          {/* Emplacement */}
          <div>
            <label className="block text-sm font-bold uppercase text-gray-900">
              Emplacement
            </label>
            <select
              name="emplacementId"
              value={formData.emplacementId}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
            >
              <option value="">— Choisir —</option>
              {emplacements.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Type d’équipement → envoyé vers typeObjet */}
          <div>
            <label className="block text-sm font-bold uppercase text-gray-900">
              Type d’équipement
            </label>
            <select
              name="typeObjet"
              value={formData.typeObjet}
              onChange={handleChange}
              disabled={!equipmentTypes.length}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
            >
              <option value="">— Choisir —</option>
              {equipmentTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Famille MI de l’équipement */}
          <div>
            <label className="block text-sm font-bold uppercase text-gray-900">
              Famille MI de l’équipement
            </label>
            <select
              name="equipementId"
              value={formData.equipementId}
              onChange={handleChange}
              disabled={!formData.typeObjet}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
            >
              <option value="">— Choisir —</option>
              {filteredEquipements.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.familleMI}
                </option>
              ))}
            </select>
          </div>

          {/* N° de série (lecture seule) */}
          {selectedEquipement && (
            <div>
              <label className="block text-sm font-bold uppercase text-gray-900">
                N° de série de l’équipement
              </label>
              <input
                type="text"
                readOnly
                value={selectedEquipement.numeroSerie}
                className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm"
              />
            </div>
          )}

          {/* Priorité */}
          <div>
            <label className="block text-sm font-bold uppercase text-gray-900">
              Priorité
            </label>
            <div className="mt-2 flex space-x-6">
              {prioriteOptions.map(({ value, label }) => (
                <label key={value} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="priorite"
                    value={value}
                    checked={formData.priorite === value}
                    onChange={handleChange}
                    required
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* État */}
          <div>
            <label className="block text-sm font-bold uppercase text-gray-900">
              État
            </label>
            <div className="mt-2 flex space-x-6">
              {etatOptions.map(({ value, label }) => (
                <label key={value} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="etat"
                    value={value}
                    checked={formData.etat === value}
                    onChange={handleChange}
                    required
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold uppercase text-gray-900">
              Description détaillée de la panne
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500"
            />
          </div>

          {/* Pièces jointes */}
          <div>
            <label className="block text-sm font-bold uppercase text-gray-900">
              Pièces jointes
            </label>
            <div className="relative mt-1 flex items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10">
              <input
                type="file"
                name="pieceJointe"
                onChange={handleChange}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <span className="text-gray-600">
                Cliquez ou déposez un fichier
              </span>
            </div>
            {formData.pieceJointe && (
              <div className="mt-2">
                <p className="text-sm text-gray-700">
                  {formData.pieceJointe.name} —{" "}
                  {uploadProgress[formData.pieceJointe.name] ?? 0}%
                </p>
                <div className="h-1 w-full rounded bg-gray-300">
                  <div
                    className="h-1 rounded bg-blue-600"
                    style={{
                      width: `${
                        uploadProgress[formData.pieceJointe.name] || 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Échéance */}
          <div>
            <label className="block text-sm font-bold uppercase text-gray-900">
              Échéance de réparation
            </label>
            <input
              type="date"
              name="echeance"
              value={formData.echeance}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500"
            />
          </div>

          {/* Submit */}
          <div className="text-center">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
}
