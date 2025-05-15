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
  CAMERA_DE_SURVEILLANCE: "CAMERA_DE_SURVEILLANCE",
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
        // 1️⃣ selon le type d’utilisateur
        .filter((p) =>
          utilisateur === UtilisateurType.ENSEIGNANT
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
  }, [formData.equipmentType, formData.utilisateur, postes, allEquipements]);

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
      <div className="mx-auto max-w-xl rounded bg-white p-6 shadow-lg">
        <h1 className="mb-4 text-xl font-bold">Ajouter Nouvel Équipement</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Champs texte */}
          {[
            { label: "Famille MI", name: "familleMI" },
            { label: "Désignation", name: "designation" },
            { label: "Code", name: "code" },
            { label: "Numéro de série", name: "numeroSerie" },
            { label: "Code inventaire", name: "codeInventaire" },
          ].map(({ label, name }) => (
            <label className="block" key={name}>
              {label}
              <input
                name={name}
                type="text"
                value={(formData as any)[name]}
                onChange={handleChange}
                required
                className="w-full rounded border p-2"
              />
            </label>
          ))}

          {/* Filtre BUREAU / CLASSE */}
          <div className="space-y-2 border-t pt-4">
            <span className="block font-medium">Type d’emplacement</span>
            <div className="flex items-center space-x-4">
              {["", "BUREAU", "CLASSE"].map((val) => (
                <label key={val} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="filterType"
                    value={val}
                    checked={filterType === val}
                    onChange={() => setFilterType(val as any)}
                    className="mr-1"
                  />
                  {val === "" ? "Tous" : val}
                </label>
              ))}
            </div>
            <label className="block">
              Choisir un emplacement
              <div className="max-h-48 overflow-y-auto rounded border">
                <select
                  name="emplacementId"
                  value={formData.emplacementId}
                  onChange={handleChange}
                  size={6}
                  className="w-full bg-white"
                  required
                >
                  <option value="" disabled>
                    — Sélectionnez un emplacement —
                  </option>
                  {Object.entries(grouped).map(([letter, list]) => (
                    <optgroup
                      key={letter}
                      label={letter}
                      className="bg-gray-100"
                    >
                      {list.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.nom}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </label>
          </div>

          {/* Utilisateur */}
          {filterType === "BUREAU" ? (
            <label className="block">
              Utilisateur (réel)
              <select
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className="w-full rounded border p-2"
                required
              >
                <option value="">Sélectionnez un utilisateur</option>
                {bureauUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nom} {u.prenom}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="block">
              Utilisateur (type)
              <select
                name="utilisateur"
                value={formData.utilisateur}
                onChange={handleChange}
                className="w-full rounded border p-2"
                required
              >
                {Object.values(UtilisateurType).map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* Type de l’équipement (après utilisateur) */}
          <label className="block">
            Type de l’équipement
            <select
              name="equipmentType"
              value={formData.equipmentType}
              onChange={handleChange}
              className="w-full rounded border p-2"
              required
            >
              {Object.values(EquipmentType).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          {/* Sélecteur Poste : uniquement pour ECRAN ou UNITE_CENTRALE */}
          {(formData.equipmentType === EquipmentType.ECRAN ||
            formData.equipmentType === EquipmentType.UNITE_CENTRALE) &&
            formData.emplacementId && (
              <label className="block">
                Poste (optionnel)
                <select
                  name="posteId"
                  value={formData.posteId}
                  onChange={handleChange}
                  className="w-full rounded border p-2"
                >
                  <option value="">Aucun poste</option>
                  {postesDispo.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.numero === null
                        ? "Poste Enseignant"
                        : `Poste ${p.numero}`}
                    </option>
                  ))}
                </select>
              </label>
            )}

          {/* État */}
          <label className="block">
            État
            <select
              name="etat"
              value={formData.etat}
              onChange={handleChange}
              className="w-full rounded border p-2"
              required
            >
              {Object.values(EquipementEtat).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          {/* Date mise en service */}
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

          {/* Maintenance */}
          <div className="space-y-2 border-t pt-4">
            <h2 className="text-lg font-semibold">Maintenance Préventive</h2>
            {formData.maintenanceRecords.map((m, i) => (
              <div key={i} className="flex gap-2">
                <select
                  name="type"
                  value={m.type}
                  onChange={(e) => handleMaintenanceChange(i, e)}
                  className="flex-1 rounded border p-2"
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
                  className="flex-2 rounded border p-2"
                  required
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
