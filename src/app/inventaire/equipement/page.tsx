// src/app/inventaire/equipement/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const UtilisateurType = {
  ENSEIGNANT: "ENSEIGNANT",
  ETUDIANT: "ETUDIANT",
} as const;

const EquipementEtat = {
  FONCTIONNEL: "FONCTIONNEL",
  EN_PANNE: "EN_PANNE",
} as const;

const MaintenanceType = {
  MENSUELLE: "MENSUELLE",
  ANNUELLE: "ANNUELLE",
  HEBDOMADAIRE: "HEBDOMADAIRE",
  SEMESTRIELLE: "SEMESTRIELLE",
  TRIMESTRIELLE: "TRIMESTRIELLE",
} as const;

const EquipmentType = {
  IMPRIMANTE: "IMPRIMANTE",
  PHOTOCOPIEUSE: "PHOTOCOPIEUSE",
  ECRAN: "ECRAN",
  ECRAN_INTERACTIF: "ECRAN INTERACTIF",
  UNITE_CENTRALE: "UNITE CENTRALE",
  SERVEUR: "SERVEUR",
  CAMERA_DE_SURVEILLANCE: "CAMERA DE SURVEILLANCE",
  TV: "TV",
} as const;

type Emplacement = { id: string; nom: string; type: string };
type User = { id: string; nom: string; prenom: string };
type Poste = {
  id: string;
  numero: number | null;
  equipements?: { equipmentType: string }[];
};
type EquipementMinimal = {
  id: string;
  posteId: string | null;
  equipmentType: string;
};

export default function AddEquipementPage() {
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";

  // emplacements, users, postes…
  const [bureaux, setBureaux] = useState<Emplacement[]>([]);
  const [classesList, setClassesList] = useState<Emplacement[]>([]);
  const [filterType, setFilterType] = useState<"" | "BUREAU" | "CLASSE">("");
  const [bureauUsers, setBureauUsers] = useState<User[]>([]);
  const [postes, setPostes] = useState<Poste[]>([]);
  const [postesDispo, setPostesDispo] = useState<Poste[]>([]);
  const [allEquipements, setAllEquipements] = useState<EquipementMinimal[]>([]);
  const [error, setError] = useState<string | null>(null);

  // form data
  const [formData, setFormData] = useState({
    familleMI: "",
    designation: "",
    code: "",
    numeroSerie: "",
    codeInventaire: "",
    equipmentType: EquipmentType.IMPRIMANTE as keyof typeof EquipmentType,
    emplacementId: "",
    posteId: "",
    utilisateur: UtilisateurType.ENSEIGNANT as keyof typeof UtilisateurType,
    userId: "",
    etat: EquipementEtat.FONCTIONNEL as keyof typeof EquipementEtat,
    dateMiseService: new Date().toISOString().slice(0, 10),
    maintenanceRecords: [] as { type: string; description: string }[],
  });

  // 1) Charger les emplacements
  useEffect(() => {
    fetch(`${API}/emplacements/bureaux`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setBureaux(Array.isArray(data) ? data : []))
      .catch(() => setBureaux([]));
    fetch(`${API}/emplacements/classes`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setClassesList(Array.isArray(data) ? data : []))
      .catch(() => setClassesList([]));
  }, [API]);

  // 2) Charger les users de bureau si besoin
  useEffect(() => {
    if (filterType === "BUREAU" && formData.emplacementId) {
      fetch(`${API}/users?emplacementId=${formData.emplacementId}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((list: any[]) =>
          setBureauUsers(
            list.map((u) => ({ id: u.id, nom: u.nom, prenom: u.prenom })),
          ),
        )
        .catch(() => setBureauUsers([]));
    } else {
      setBureauUsers([]);
    }
  }, [filterType, formData.emplacementId, API]);

  // 3) Charger les postes de l’emplacement choisi
  useEffect(() => {
    if (!formData.emplacementId) {
      setPostes([]);
      return;
    }
    fetch(`${API}/postes?emplacementId=${formData.emplacementId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list: Poste[]) => setPostes(list))
      .catch(() => setPostes([]));

    // et en même temps on charge tous les équipements de cet emplacement
    fetch(`${API}/equipements?emplacementId=${formData.emplacementId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list: any[]) =>
        setAllEquipements(
          Array.isArray(list)
            ? list.map((eq) => ({
                id: eq.id,
                posteId: eq.posteId,
                equipmentType: eq.equipmentType,
              }))
            : [],
        ),
      )
      .catch(() => setAllEquipements([]));
  }, [formData.emplacementId, API]);

  // 4) Filtrer les postes disponibles selon utilisateur et équipement
  useEffect(() => {
    const { equipmentType, utilisateur } = formData;
    if (
      equipmentType !== EquipmentType.ECRAN &&
      equipmentType !== EquipmentType.UNITE_CENTRALE
    ) {
      setPostesDispo([]);
      return;
    }
    setPostesDispo(
      postes
        // 1️⃣ selon le contexte : si on est en BUREAU, on garde tous les postes,
        //    sinon on applique le filtre enseignant/étudiant
        .filter((p) =>
          filterType === "BUREAU"
            ? true
            : utilisateur === UtilisateurType.ENSEIGNANT
              ? p.numero === null
              : p.numero !== null,
        )
        // 2️⃣ et s’ils n’ont pas déjà un équipement de ce type
        .filter((p) => {
          const types = allEquipements
            .filter((e) => e.posteId === p.id)
            .map((e) => e.equipmentType);
          return !types.includes(equipmentType);
        }),
    );
  }, [
    formData.equipmentType,
    formData.utilisateur,
    filterType, // ← on ajoute filterType au deps
    postes,
    allEquipements,
  ]);

  // 5) Groupement des emplacements pour l’affichage
  const options = useMemo(() => {
    if (filterType === "BUREAU") return bureaux;
    if (filterType === "CLASSE") return classesList;
    return [...bureaux, ...classesList];
  }, [bureaux, classesList, filterType]);

  const grouped = useMemo(() => {
    return options
      .sort((a, b) => a.nom.localeCompare(b.nom, undefined, { numeric: true }))
      .reduce((acc: Record<string, Emplacement[]>, e) => {
        const L = e.nom[0].toUpperCase();
        (acc[L] ||= []).push(e);
        return acc;
      }, {});
  }, [options]);

  // handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((fd) => ({ ...fd, [name]: value }));
  };
  const handleMaintenanceChange = (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const mr = [...formData.maintenanceRecords];
    mr[idx] = { ...mr[idx], [e.target.name]: e.target.value };
    setFormData((fd) => ({ ...fd, maintenanceRecords: mr }));
  };
  const addMaintenanceRow = () =>
    setFormData((fd) => ({
      ...fd,
      maintenanceRecords: [
        ...fd.maintenanceRecords,
        { type: MaintenanceType.MENSUELLE, description: "" },
      ],
    }));
  const removeMaintenanceRow = (idx: number) =>
    setFormData((fd) => ({
      ...fd,
      maintenanceRecords: fd.maintenanceRecords.filter((_, i) => i !== idx),
    }));

  // 6) Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.emplacementId) {
      setError("Veuillez sélectionner un emplacement.");
      return;
    }
    try {
      const res = await fetch(`${API}/equipements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setError(
            `Ce poste a déjà un équipement de type ${formData.equipmentType}`,
          );
          return;
        }
        throw new Error(result.message || "Erreur serveur");
      }
      // reset
      setFormData({
        familleMI: "",
        designation: "",
        code: "",
        numeroSerie: "",
        codeInventaire: "",
        equipmentType: EquipmentType.IMPRIMANTE,
        emplacementId: "",
        posteId: "",
        utilisateur: UtilisateurType.ENSEIGNANT,
        userId: "",
        etat: EquipementEtat.FONCTIONNEL,
        dateMiseService: new Date().toISOString().slice(0, 10),
        maintenanceRecords: [],
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-2xl space-y-12 p-8">
        {/* Titre principal */}
        <h1 className="text-center text-4xl font-extrabold text-gray-900">
          Ajouter un Nouvel Équipement
        </h1>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* ==== Informations de base ==== */}
          <section className="overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="bg-blue-50 py-3 text-center">
              <h2 className="text-xl font-semibold text-blue-700">
                Informations de base
              </h2>
            </div>
            {/* Body */}
            <div className="grid grid-cols-1 gap-6 p-8 sm:grid-cols-2">
              {[
                { icon: "📦", label: "Famille MI", name: "familleMI" },
                { icon: "🏷️", label: "Désignation", name: "designation" },
                { icon: "🔢", label: "Code", name: "code" },
                { icon: "🔖", label: "N° Série", name: "numeroSerie" },
                {
                  icon: "💼",
                  label: "Code Inventaire",
                  name: "codeInventaire",
                },
              ].map(({ icon, label, name }) => (
                <div
                  key={name}
                  className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 transition focus-within:ring-2 focus-within:ring-blue-300 hover:shadow-md"
                >
                  <span className="text-2xl">{icon}</span>
                  <input
                    id={name}
                    name={name}
                    type="text"
                    value={(formData as any)[name]}
                    onChange={handleChange}
                    required
                    placeholder={label}
                    className="flex-1 rounded-lg border-0 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ==== Emplacement & Utilisateur ==== */}
          <section className="overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="bg-blue-50 py-3 text-center">
              <h2 className="text-xl font-semibold text-blue-700">
                Emplacement & Utilisateur
              </h2>
            </div>
            {/* Body */}
            <div className="p-8">
              {/* Filtre */}
              <div className="mb-6 flex gap-4">
                {["Tous", "BUREAU", "CLASSE"].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      setFilterType(val === "Tous" ? "" : (val as any))
                    }
                    className={`flex-1 rounded-full py-2 font-medium transition ${
                      (filterType === "" && val === "Tous") ||
                      filterType === val
                        ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow"
                        : "bg-white text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {[
                  {
                    name: "emplacementId",
                    label: "Emplacement",
                    icon: "📍",
                    options: Object.entries(grouped).flatMap(([_, list]) =>
                      list.map((e) => ({ value: e.id, label: e.nom })),
                    ),
                  },
                  {
                    name: filterType === "BUREAU" ? "userId" : "utilisateur",
                    label:
                      filterType === "BUREAU"
                        ? "Utilisateur réel"
                        : "Type d’utilisateur",
                    icon: "👤",
                    options:
                      filterType === "BUREAU"
                        ? bureauUsers.map((u) => ({
                            value: u.id,
                            label: `${u.nom} ${u.prenom}`,
                          }))
                        : Object.values(UtilisateurType).map((v) => ({
                            value: v,
                            label: v,
                          })),
                  },
                ].map(({ name, label, icon, options }) => (
                  <div
                    key={name}
                    className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 transition focus-within:ring-2 focus-within:ring-blue-300 hover:shadow-md"
                  >
                    <span className="text-2xl">{icon}</span>
                    <select
                      name={name}
                      value={(formData as any)[name]}
                      onChange={handleChange}
                      required
                      className="flex-1 bg-transparent text-gray-900 focus:outline-none"
                    >
                      <option value="">{label}</option>
                      {options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ==== Détails Équipement ==== */}
          <section className="overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="bg-blue-50 py-3 text-center">
              <h2 className="text-xl font-semibold text-blue-700">
                Détails Équipement
              </h2>
            </div>
            {/* Body */}
            <div className="grid grid-cols-1 gap-6 p-8 sm:grid-cols-2">
              {[
                {
                  name: "equipmentType",
                  label: "Type d’équipement",
                  icon: "🖥️",
                  opts: Object.values(EquipmentType),
                },
                {
                  name: "etat",
                  label: "État",
                  icon: "🔧",
                  opts: Object.values(EquipementEtat),
                },
              ].map(({ name, label, icon, opts }) => (
                <div
                  key={name}
                  className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 transition focus-within:ring-2 focus-within:ring-blue-300 hover:shadow-md"
                >
                  <span className="text-2xl">{icon}</span>
                  <select
                    name={name}
                    value={(formData as any)[name]}
                    onChange={handleChange}
                    required
                    className="flex-1 bg-transparent text-gray-900 focus:outline-none"
                  >
                    <option value="">{label}</option>
                    {opts.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              {/* Date mise en service */}
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 transition focus-within:ring-2 focus-within:ring-blue-300 hover:shadow-md">
                <span className="text-2xl">📅</span>
                <input
                  name="dateMiseService"
                  type="date"
                  value={formData.dateMiseService}
                  onChange={handleChange}
                  required
                  className="flex-1 bg-transparent text-gray-900 focus:outline-none"
                />
              </div>

              {/* Poste (optionnel) */}
              {(formData.equipmentType === EquipmentType.ECRAN ||
                formData.equipmentType === EquipmentType.UNITE_CENTRALE) &&
                formData.emplacementId && (
                  <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 transition focus-within:ring-2 focus-within:ring-blue-300 hover:shadow-md sm:col-span-2">
                    <span className="text-2xl">💻</span>
                    <select
                      name="posteId"
                      value={formData.posteId}
                      onChange={handleChange}
                      className="flex-1 bg-transparent text-gray-900 focus:outline-none"
                    >
                      <option value="">Aucun poste</option>
                      {postesDispo.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.numero == null
                            ? "Poste Enseignant"
                            : `Poste ${p.numero}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
            </div>
          </section>

          {/* ==== Maintenance Préventive ==== */}
          <section className="overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="bg-blue-50 py-3 text-center">
              <h2 className="text-xl font-semibold text-blue-700">
                Maintenance Préventive
              </h2>
            </div>
            {/* Body */}
            <div className="space-y-4 p-8">
              {formData.maintenanceRecords.map((m, i) => (
                <div key={i} className="flex gap-4">
                  <select
                    name="type"
                    value={m.type}
                    onChange={(e) => handleMaintenanceChange(i, e)}
                    className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 transition focus-within:ring-2 focus-within:ring-blue-300 hover:shadow-md"
                    required
                  >
                    {Object.values(MaintenanceType).map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <input
                    name="description"
                    value={m.description}
                    onChange={(e) => handleMaintenanceChange(i, e)}
                    placeholder="Description"
                    className="flex-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 transition focus-within:ring-2 focus-within:ring-blue-300 hover:shadow-md"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeMaintenanceRow(i)}
                    className="mt-2 text-2xl text-red-500 transition hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addMaintenanceRow}
                className="mt-4 inline-block font-medium text-blue-600 hover:text-blue-800"
              >
                + Ajouter maintenance
              </button>
            </div>
          </section>

          {/* Message d’erreur */}
          {error && <div className="text-center text-red-600">{error}</div>}

          {/* ==== Bouton final ==== */}
          <button
            type="submit"
            className="mx-auto block rounded-full bg-gradient-to-r from-blue-600 to-blue-800 px-12 py-4 text-2xl font-bold text-white shadow-2xl transition hover:from-blue-700 hover:to-blue-900"
          >
            Ajouter l’équipement
          </button>
        </form>
      </div>
    </DefaultLayout>
  );
}
