/* eslint-disable react/jsx-key */
// src/app/inventaire/equipement/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Calendar, Edit2, Trash2 } from "lucide-react";
import { Tag, FileText, Hash, MapPin, User, CheckCircle } from "lucide-react";

interface Emplacement {
  id: string;
  nom: string;
  type: "BUREAU" | "CLASSE";
}

interface User {
  id: string;
  nom: string;
  prenom: string;
}

type MaintenanceType =
  | "HEBDOMADAIRE"
  | "MENSUELLE"
  | "TRIMESTRIELLE"
  | "SEMESTRIELLE"
  | "ANNUELLE";

interface MaintenanceRecord {
  id: string;
  type: MaintenanceType;
  description: string;
}

interface Equipement {
  id: string;
  familleMI: string;
  designation: string;
  equipmentType: string;
  emplacement: Emplacement | null;
  utilisateur: string | null;
  user: User | null;
  etat: string;
  maintenanceRecords: MaintenanceRecord[];
}

export default function TableEquipementsPage() {
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";

  // États principaux
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [emplacements, setEmplacements] = useState<Emplacement[]>([]);
  const [bureauUsers, setBureauUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEquip, setSelectedEquip] = useState<Equipement | null>(null);

  // Filtres
  const [filters, setFilters] = useState<Record<string, string>>({
    familleMI: "",
    designation: "",
    equipmentType: "",
    emplacement: "",
    utilisateur: "",
    etat: "",
  });

  // États maintenance
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState<MaintenanceType>("HEBDOMADAIRE");
  const [editDesc, setEditDesc] = useState("");
  const [pendingDelete, setPendingDelete] = useState<MaintenanceRecord | null>(
    null,
  );
  const [newMaintType, setNewMaintType] =
    useState<MaintenanceType>("MENSUELLE");
  const [newMaintDesc, setNewMaintDesc] = useState("");
  const [newMaintError, setNewMaintError] = useState("");

  // 1) Chargement
  useEffect(() => {
    fetch(`${API}/equipements`)
      .then((r) => r.json())
      .then((d) => setEquipements(d.items))
      .catch(console.error);

    fetch(`${API}/emplacements`)
      .then((r) => r.json())
      .then((d) => setEmplacements(d.items))
      .catch(console.error);
  }, [API]);

  // 2) Ouvre modal
  const openModal = async (id: string) => {
    try {
      const res = await fetch(`${API}/equipements/${id}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data: Equipement = await res.json();
      setSelectedEquip(data);
      setShowModal(true);
    } catch (err) {
      console.error("Impossible de charger le détail :", err);
    }
  };

  // 3) Charge users pour bureau
  useEffect(() => {
    if (selectedEquip?.emplacement?.type === "BUREAU") {
      fetch(`${API}/users?emplacementId=${selectedEquip.emplacement.id}`)
        .then((r) => r.json())
        .then((list: User[]) => setBureauUsers(list))
        .catch(() => setBureauUsers([]));
    } else {
      setBureauUsers([]);
    }
  }, [selectedEquip, API]);

  // 4) Filtrage
  const handleFilterChange = (e: React.ChangeEvent<any>) =>
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));

  const filteredData = useMemo(
    () =>
      equipements.filter((eq) =>
        (Object.entries(filters) as [string, string][]).every(([key, val]) => {
          if (!val) return true;
          let field = "";
          switch (key) {
            case "emplacement":
              field = eq.emplacement?.nom ?? "";
              break;
            case "utilisateur":
              field = eq.user
                ? `${eq.user.nom} ${eq.user.prenom}`
                : (eq.utilisateur ?? "");
              break;
            default:
              field = (eq as any)[key] ?? "";
          }
          return field.toLowerCase().includes(val.toLowerCase());
        }),
      ),
    [equipements, filters],
  );

  // 5) Sauvegarde
  const saveEquip = async () => {
    if (!selectedEquip) return;
    const { id, emplacement, user, utilisateur, maintenanceRecords, ...rest } =
      selectedEquip;
    const payload: any = { ...rest, emplacementId: emplacement?.id };
    if (emplacement?.type === "BUREAU") payload.userId = user?.id ?? null;
    else payload.utilisateur = utilisateur;

    await fetch(`${API}/equipements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const updated = await (await fetch(`${API}/equipements`)).json();
    setEquipements(updated.items);
    setShowModal(false);
    setSelectedEquip(null);
  };

  // 6) Suppression équipement
  const deleteEquip = async () => {
    if (!selectedEquip) return;
    await fetch(`${API}/equipements/${selectedEquip.id}`, {
      method: "DELETE",
    });
    setEquipements((eqs) => eqs.filter((e) => e.id !== selectedEquip.id));
    setShowModal(false);
    setSelectedEquip(null);
  };

  // 7) CRUD maintenance
  const addMaintenance = async (rec: Omit<MaintenanceRecord, "id">) => {
    if (!selectedEquip) return;
    const res = await fetch(
      `${API}/equipements/${selectedEquip.id}/maintenance`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rec),
      },
    );
    const newRec = await res.json();
    setSelectedEquip((eq) =>
      eq
        ? { ...eq, maintenanceRecords: [...eq.maintenanceRecords, newRec] }
        : eq,
    );
  };

  const updateMaintenance = async (rec: MaintenanceRecord) => {
    await fetch(`${API}/equipements/maintenance/${rec.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: rec.type, description: rec.description }),
    });
    setSelectedEquip((eq) =>
      eq
        ? {
            ...eq,
            maintenanceRecords: eq.maintenanceRecords.map((r) =>
              r.id === rec.id ? rec : r,
            ),
          }
        : eq,
    );
    setEditingId(null);
  };

  const deleteMaintenanceConfirmed = async (recId: string) => {
    await fetch(`${API}/equipements/maintenance/${recId}`, {
      method: "DELETE",
    });
    setSelectedEquip((eq) =>
      eq
        ? {
            ...eq,
            maintenanceRecords: eq.maintenanceRecords.filter(
              (r) => r.id !== recId,
            ),
          }
        : eq,
    );
    setPendingDelete(null);
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-full px-4 py-6">
        <h1 className="mb-6 text-center text-3xl font-extrabold text-blue-600">
          Liste des équipements
        </h1>

        {/* Tableau */}
        <div className="relative overflow-x-auto rounded-2xl bg-white shadow-2xl">
          <div className="scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent max-h-[70vh] overflow-y-auto">
            <table className="min-w-full table-auto border-separate [border-spacing:0]">
              <thead>
                <tr className="sticky top-0 z-20 bg-gradient-to-r from-blue-700 to-blue-500 text-white">
                  {[
                    "Famille MI",
                    "Désignation",
                    "Type",
                    "Emplacement",
                    "Utilisateur",
                    "État",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
                <tr className="sticky top-[48px] z-10 bg-white/70 backdrop-blur-sm">
                  {[
                    { name: "familleMI", type: "input" },
                    { name: "designation", type: "input" },
                    {
                      name: "equipmentType",
                      type: "select",
                      opts: [
                        ...new Set(equipements.map((e) => e.equipmentType)),
                      ],
                    },
                    {
                      name: "emplacement",
                      type: "select",
                      opts: emplacements.map((e) => e.nom),
                    },
                    { name: "utilisateur", type: "input" },
                    {
                      name: "etat",
                      type: "select",
                      opts: ["FONCTIONNEL", "EN_PANNE"],
                    },
                  ].map((f, i) => (
                    <th key={i} className="px-4 py-2">
                      {f.type === "input" ? (
                        <input
                          name={f.name}
                          value={(filters as any)[f.name]}
                          onChange={handleFilterChange}
                          placeholder="…"
                          className="w-full rounded-lg border border-blue-300 bg-white/80 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      ) : (
                        <select
                          name={f.name}
                          value={(filters as any)[f.name]}
                          onChange={handleFilterChange}
                          className="w-full rounded-lg border border-blue-300 bg-white/80 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="">Tous</option>
                          {f.opts!.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {filteredData.map((eq, idx) => (
                  <tr
                    key={eq.id}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-blue-50"
                    } cursor-pointer transition-colors duration-200 hover:!bg-blue-100`}
                    onClick={() => openModal(eq.id)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {eq.familleMI}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {eq.designation}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {eq.equipmentType}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {eq.emplacement?.nom}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {eq.emplacement?.type === "BUREAU" && eq.user
                        ? `${eq.user.nom} ${eq.user.prenom}`
                        : (eq.utilisateur ?? "Aucun")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {eq.etat}
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      Aucune donnée trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/**
         * Place ce code à la place de ton ancien bloc {showModal && selectedEquip && (...) }
         * Assure-toi d'avoir importé en haut :
         *   useState pour newMaintType, newMaintDesc, newMaintError
         */}
        {showModal && selectedEquip && (
          <>
            {/* Overlay */}
            <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />

            {/* Container */}
            <div className="fixed inset-[90px_0_0_350px] z-50 flex items-center justify-center p-4">
              <div className="animate-scaleIn relative max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
                {/* En-tête */}
                <div className="flex items-center justify-between bg-blue-600 px-6 py-4">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                    <FileText size={20} /> Détails équipement
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    aria-label="Fermer"
                    className="text-white hover:opacity-80 focus:outline-none"
                  >
                    ✕
                  </button>
                </div>

                {/* Corps */}
                <div className="space-y-6 p-6 text-gray-800">
                  {/* — Informations générales — */}
                  <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {(
                      [
                        [<Tag />, "Famille MI", selectedEquip.familleMI],
                        [
                          <FileText />,
                          "Désignation",
                          selectedEquip.designation,
                        ],
                        [<Hash />, "Code", selectedEquip.code],
                        [<Hash />, "N° de série", selectedEquip.numeroSerie],
                        [
                          <Hash />,
                          "Code inventaire",
                          selectedEquip.codeInventaire,
                        ],
                        [
                          <Hash />,
                          "Date mise en service",
                          selectedEquip.dateMiseService,
                        ],
                        [
                          <Hash />,
                          "Type d’équipement",
                          selectedEquip.equipmentType,
                        ],
                        [<CheckCircle />, "État", selectedEquip.etat],
                      ] as const
                    ).map(([IconEl, label, val], i) => (
                      <div key={i} className="flex flex-col">
                        <label className="mb-1 flex items-center gap-1 text-sm font-medium">
                          {IconEl} {label}
                        </label>
                        <input
                          readOnly
                          value={val}
                          className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm focus:outline-none"
                        />
                      </div>
                    ))}

                    {/* Emplacement */}
                    <div className="col-span-full flex flex-col">
                      <label className="mb-1 flex items-center gap-1 text-sm font-medium">
                        <MapPin size={16} /> Emplacement
                      </label>
                      <select
                        value={selectedEquip.emplacement?.id || ""}
                        onChange={(e) => {
                          const emp =
                            emplacements.find((x) => x.id === e.target.value) ||
                            null;
                          setSelectedEquip({
                            ...selectedEquip,
                            emplacement: emp,
                          });
                        }}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="">Aucun</option>
                        {emplacements.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.nom}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Utilisateur */}
                    <div className="col-span-full flex flex-col">
                      <label className="mb-1 flex items-center gap-1 text-sm font-medium">
                        <User size={16} /> Utilisateur
                      </label>
                      <select
                        value={
                          selectedEquip.emplacement?.type === "BUREAU"
                            ? selectedEquip.user?.id || ""
                            : selectedEquip.utilisateur || ""
                        }
                        onChange={(e) => {
                          if (selectedEquip.emplacement?.type === "BUREAU") {
                            const u =
                              bureauUsers.find(
                                (u) => u.id === e.target.value,
                              ) || null;
                            setSelectedEquip({ ...selectedEquip, user: u });
                          } else {
                            setSelectedEquip({
                              ...selectedEquip,
                              utilisateur: e.target.value,
                            });
                          }
                        }}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        {selectedEquip.emplacement?.type === "BUREAU" ? (
                          <>
                            <option value="">
                              Sélectionner un utilisateur
                            </option>
                            {bureauUsers.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.nom} {u.prenom}
                              </option>
                            ))}
                          </>
                        ) : (
                          <>
                            <option value="ENSEIGNANT">ENSEIGNANT</option>
                            <option value="ETUDIANT">ETUDIANT</option>
                          </>
                        )}
                      </select>
                    </div>
                  </section>

                  <hr className="border-gray-200" />

                  {/* — Maintenance préventive — */}
                  <section className="space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Edit2 size={16} /> Maintenance préventive
                    </h3>

                    {/* Ajout */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <select
                          value={newMaintType}
                          onChange={(e) =>
                            setNewMaintType(e.target.value as MaintenanceType)
                          }
                          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                        >
                          {[
                            "HEBDOMADAIRE",
                            "MENSUELLE",
                            "TRIMESTRIELLE",
                            "SEMESTRIELLE",
                            "ANNUELLE",
                          ].map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <div className="flex-1">
                          <input
                            value={newMaintDesc}
                            onChange={(e) => {
                              setNewMaintDesc(e.target.value);
                              setNewMaintError("");
                            }}
                            placeholder="Description*"
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                          />
                          {newMaintError && (
                            <p className="mt-1 text-xs text-red-600">
                              {newMaintError}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            if (!newMaintDesc.trim()) {
                              setNewMaintError(
                                "La description est obligatoire",
                              );
                              return;
                            }
                            addMaintenance({
                              type: newMaintType,
                              description: newMaintDesc,
                            });
                            setNewMaintDesc("");
                          }}
                          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
                        >
                          + Ajouter
                        </button>
                      </div>
                    </div>

                    {/* Liste */}
                    <ul className="scrollbar-thin scrollbar-thumb-blue-400 max-h-56 space-y-3 overflow-y-auto">
                      {selectedEquip.maintenanceRecords.map((rec) => {
                        const isEd = rec.id === editingId;
                        return (
                          <li
                            key={rec.id}
                            className="flex flex-col gap-2 sm:flex-row sm:items-center"
                          >
                            {isEd ? (
                              <>
                                <select
                                  value={editType}
                                  onChange={(e) =>
                                    setEditType(
                                      e.target.value as MaintenanceType,
                                    )
                                  }
                                  className="w-36 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                >
                                  {[
                                    "HEBDOMADAIRE",
                                    "MENSUELLE",
                                    "TRIMESTRIELLE",
                                    "SEMESTRIELLE",
                                    "ANNUELLE",
                                  ].map((t) => (
                                    <option key={t} value={t}>
                                      {t}
                                    </option>
                                  ))}
                                </select>
                                <div className="flex-1">
                                  <input
                                    value={editDesc}
                                    onChange={(e) =>
                                      setEditDesc(e.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      if (!editDesc.trim()) return;
                                      updateMaintenance({
                                        id: rec.id,
                                        type: editType,
                                        description: editDesc,
                                      });
                                    }}
                                    className="rounded bg-green-700 px-3 py-1 text-xs font-semibold text-white hover:bg-green-800 focus:outline-none"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 focus:outline-none"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <span className="w-36 text-sm font-medium text-gray-800">
                                  {rec.type}
                                </span>
                                <span className="flex-1 text-sm text-gray-600">
                                  {rec.description}
                                </span>
                                <div className="ml-auto flex gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingId(rec.id);
                                      setEditType(rec.type);
                                      setEditDesc(rec.description);
                                    }}
                                    className="rounded p-1 hover:bg-blue-50 focus:outline-none"
                                    aria-label="Modifier"
                                  >
                                    <Edit2
                                      size={16}
                                      className="text-blue-600"
                                    />
                                  </button>
                                  <button
                                    onClick={() => setPendingDelete(rec)}
                                    className="rounded p-1 hover:bg-red-50 focus:outline-none"
                                    aria-label="Supprimer"
                                  >
                                    <Trash2
                                      size={16}
                                      className="text-red-600"
                                    />
                                  </button>
                                </div>
                              </>
                            )}
                          </li>
                        );
                      })}
                    </ul>

                    {/* Confirmation suppression */}
                    {pendingDelete && (
                      <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30">
                        <div className="rounded-lg bg-white p-6 text-center shadow-lg ring-1 ring-gray-200">
                          <p className="mb-4 text-sm text-gray-700">
                            Supprimer « {pendingDelete.type} » ?
                          </p>
                          <div className="flex justify-center gap-4">
                            <button
                              onClick={() => setPendingDelete(null)}
                              className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 focus:outline-none"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() =>
                                deleteMaintenanceConfirmed(pendingDelete.id)
                              }
                              className="rounded bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 focus:outline-none"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Footer */}
                  <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                    <button
                      onClick={() =>
                        window.confirm("Supprimer cet équipement ?") &&
                        deleteEquip()
                      }
                      className="rounded bg-red-700 px-5 py-2 text-sm font-medium text-white hover:bg-red-800 focus:outline-none"
                    >
                      Supprimer
                    </button>
                    <button
                      onClick={saveEquip}
                      className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="rounded border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 focus:outline-none"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DefaultLayout>
  );
}
