// src/app/inventaire/equipement/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Edit2, Trash2 } from "lucide-react";
import {
  Tag,
  FileText,
  Hash,
  Calendar,
  MapPin,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
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
  code: string;
  numeroSerie: string;
  codeInventaire: string;
  dateMiseService: string;
  emplacement: Emplacement | null;
  utilisateur: string | null;
  user: User | null;
  etat: string;
  maintenanceRecords: MaintenanceRecord[];
}

export default function TableEquipementsPage() {
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";

  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [emplacements, setEmplacements] = useState<Emplacement[]>([]);
  const [bureauUsers, setBureauUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEquip, setSelectedEquip] = useState<Equipement | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({
    familleMI: "",
    designation: "",
    code: "",
    numeroSerie: "",
    codeInventaire: "",
    dateMiseService: "",
    emplacement: "",
    utilisateur: "",
    etat: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState<MaintenanceType>("HEBDOMADAIRE");
  const [editDesc, setEditDesc] = useState("");
  const [pendingDelete, setPendingDelete] = useState<MaintenanceRecord | null>(
    null,
  );

  // 1) Charger la liste
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

  // 2) Ouvre modal & charge détail
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

  // 3) Quand modal ouverte et BUREAU, charger ses users
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

  const handleFilterChange = (e: React.ChangeEvent<any>) =>
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));

  const filteredData = useMemo(
    () =>
      equipements.filter((eq) =>
        Object.entries(filters).every(([key, val]) => {
          if (!val) return true;
          const field =
            key === "emplacement"
              ? (eq.emplacement?.nom ?? "")
              : key === "utilisateur"
                ? eq.user
                  ? `${eq.user.nom} ${eq.user.prenom}`
                  : (eq.utilisateur ?? "")
                : ((eq as any)[key] ?? "");
          return field.toLowerCase().includes(val.toLowerCase());
        }),
      ),
    [equipements, filters],
  );

  // Sauvegarde PATCH
  const saveEquip = async () => {
    if (!selectedEquip) return;
    const { id, emplacement, maintenanceRecords, user, utilisateur, ...rest } =
      selectedEquip;

    const payload: any = {
      ...rest,
      emplacementId: emplacement?.id,
    };
    if (emplacement?.type === "BUREAU") payload.userId = user?.id ?? null;
    else payload.utilisateur = utilisateur;

    await fetch(`${API}/equipements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    // reload
    const updated = await (await fetch(`${API}/equipements`)).json();
    setEquipements(updated.items);
    setShowModal(false);
    setSelectedEquip(null);
  };

  // Suppression équipement
  const deleteEquip = async () => {
    if (!selectedEquip) return;
    await fetch(`${API}/equipements/${selectedEquip.id}`, { method: "DELETE" });
    setEquipements((eqs) => eqs.filter((e) => e.id !== selectedEquip.id));
    setShowModal(false);
    setSelectedEquip(null);
  };

  // CRUD maintenance
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
        <h1 className="mb-4 text-2xl font-bold text-blue-700">
          Liste des équipements
        </h1>

        {/* Tableau “Dashboard” Ultra-Modern */}
        <div className="relative overflow-x-auto rounded-2xl bg-white shadow-2xl">
          {/* Scroll interne */}
          <div className="scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent max-h-[70vh] overflow-y-auto">
            <table className="min-w-full table-auto border-separate [border-spacing:0]">
              <thead>
                {/* En-tête en gradient plus doux */}
                <tr className="sticky top-0 z-20 bg-gradient-to-r from-blue-700 to-blue-500 text-white">
                  {[
                    "Famille MI",
                    "Désignation",
                    "Code",
                    "N° de série",
                    "Code inv.",
                    "Date de mise",
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
                {/* Filtres Glassmorphism */}
                <tr className="sticky top-[48px] z-10 bg-white/70 backdrop-blur-sm">
                  {[
                    {
                      name: "familleMI",
                      type: "select",
                      opts: [...new Set(equipements.map((e) => e.familleMI))],
                    },
                    { name: "designation", type: "input" },
                    { name: "code", type: "input" },
                    { name: "numeroSerie", type: "input" },
                    { name: "codeInventaire", type: "input" },
                    { name: "dateMiseService", type: "date" },
                    {
                      name: "emplacement",
                      type: "select",
                      opts: emplacements.map((e) => e.nom),
                    },
                    { name: "utilisateur", type: "input" },
                    {
                      name: "etat",
                      type: "select",
                      opts: [...new Set(equipements.map((e) => e.etat))],
                    },
                  ].map((f, i) => (
                    <th key={i} className="px-4 py-2">
                      {f.type === "input" ? (
                        <input
                          name={f.name}
                          value={(filters as any)[f.name]}
                          onChange={handleFilterChange}
                          placeholder="…"
                          className="
                    w-full rounded-lg border border-blue-300 bg-white/80 px-3
                    py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400
                  "
                        />
                      ) : f.type === "date" ? (
                        <input
                          type="date"
                          name={f.name}
                          value={(filters as any)[f.name]}
                          onChange={handleFilterChange}
                          className="
                    w-full rounded-lg border border-blue-300 bg-white/80 px-3
                    py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400
                  "
                        />
                      ) : (
                        <select
                          name={f.name}
                          value={(filters as any)[f.name]}
                          onChange={handleFilterChange}
                          className="
                    w-full rounded-lg border border-blue-300 bg-white/80 px-3
                    py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400
                  "
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
                    className={`
              ${idx % 2 === 0 ? "bg-white" : "bg-blue-50"}
              cursor-pointer transition-colors duration-200 hover:!bg-blue-100
            `}
                    onClick={() => openModal(eq.id)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {eq.familleMI}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {eq.designation}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {eq.code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {eq.numeroSerie}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {eq.codeInventaire}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {eq.dateMiseService}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {eq.emplacement?.nom}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {eq.emplacement?.type === "BUREAU" && eq.user
                        ? `${eq.user.nom} ${eq.user.prenom}`
                        : eq.utilisateur}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {eq.etat}
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
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

        {showModal && selectedEquip && (
          <>
            {/* CSS inline */}
            <style jsx>{`
              @keyframes scaleIn {
                from {
                  opacity: 0;
                  transform: scale(0.95);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }
              .animate-scaleIn {
                animation: scaleIn 0.2s ease-out forwards;
              }
              /* Scroll moderne */
              .scrollbar-thin {
                scrollbar-width: thin;
              }
              .scrollbar-thumb {
                scrollbar-color: #cbd5e0 transparent;
              }
              .scrollbar-thin::-webkit-scrollbar {
                width: 6px;
              }
              .scrollbar-thin::-webkit-scrollbar-track {
                background: transparent;
              }
              .scrollbar-thin::-webkit-scrollbar-thumb {
                background-color: #cbd5e0;
                border-radius: 3px;
              }
            `}</style>

            {/* Overlay */}
            <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />

            {/* Modal container */}
            <div
              className="
        fixed inset-[90px_0_0_350px] z-50 flex 
        items-center justify-center p-4
      "
            >
              <div
                className="
          animate-scaleIn scrollbar-thin scrollbar-thumb relative
          max-h-[80vh] w-full
          max-w-2xl overflow-y-auto
        "
              >
                {/* Carte */}
                <div className="relative overflow-hidden rounded-xl bg-white shadow-2xl">
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

                  {/* Corps défilable si besoin */}
                  <div className="space-y-8 p-6">
                    {/* Grille des champs */}
                    <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {(
                        [
                          // eslint-disable-next-line react/jsx-key
                          [<Tag />, "Famille MI", selectedEquip.familleMI],
                          [
                            // eslint-disable-next-line react/jsx-key
                            <FileText />,
                            "Désignation",
                            selectedEquip.designation,
                          ],
                          // eslint-disable-next-line react/jsx-key
                          [<Hash />, "Code", selectedEquip.code],
                          // eslint-disable-next-line react/jsx-key
                          [<Hash />, "N° de série", selectedEquip.numeroSerie],
                          // eslint-disable-next-line react/jsx-key
                          [<Hash />, "Code inv.", selectedEquip.codeInventaire],
                          [
                            // eslint-disable-next-line react/jsx-key
                            <Calendar />,
                            "Date service",
                            selectedEquip.dateMiseService,
                          ],
                        ] as const
                      ).map(([IconEl, label, val], i) => (
                        <div key={i} className="relative flex flex-col">
                          <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                            {IconEl} {label}
                          </label>
                          <div className="relative">
                            <input
                              readOnly
                              value={val}
                              className="
                        w-full rounded-md border border-gray-300 bg-gray-100
                        py-2 pl-10 pr-4 text-sm shadow-inner
                        focus:outline-none focus:ring-2 focus:ring-blue-200
                      "
                            />
                            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                              {IconEl}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Utilisateur */}
                      <div className="col-span-full flex flex-col">
                        <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                          <User size={16} /> Utilisateur *
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
                          className="rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
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

                      {/* État */}
                      <div className="flex flex-col">
                        <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                          <CheckCircle size={16} /> État *
                        </label>
                        <select
                          value={selectedEquip.etat}
                          onChange={(e) =>
                            setSelectedEquip({
                              ...selectedEquip,
                              etat: e.target.value,
                            })
                          }
                          className="rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                        >
                          <option value="FONCTIONNEL">FONCTIONNEL</option>
                          <option value="EN_PANNE">EN_PANNE</option>
                        </select>
                      </div>

                      {/* Emplacement */}
                      <div className="col-span-full flex flex-col">
                        <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                          <MapPin size={16} /> Emplacement *
                        </label>
                        <select
                          value={selectedEquip.emplacement?.id || ""}
                          onChange={(e) => {
                            const emp =
                              emplacements.find(
                                (x) => x.id === e.target.value,
                              ) || null;
                            setSelectedEquip({
                              ...selectedEquip,
                              emplacement: emp,
                            });
                          }}
                          className="rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                        >
                          <option value="">Aucun</option>
                          {emplacements.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.nom}
                            </option>
                          ))}
                        </select>
                      </div>
                    </section>

                    <hr className="border-gray-200" />

                    {/* Maintenance préventive */}
                    <section>
                      <h3 className="text-md mb-4 flex items-center gap-2 font-medium text-gray-700">
                        <Edit2 size={16} /> Maintenance préventive
                      </h3>

                      {/* Ajout */}
                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        <select
                          id="newType"
                          className="rounded-md border border-gray-300 px-4 py-2 text-sm"
                          defaultValue="MENSUELLE"
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
                        <input
                          id="newDesc"
                          placeholder="Description*"
                          className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm"
                        />
                        <button
                          onClick={() => {
                            const type = (
                              document.getElementById(
                                "newType",
                              ) as HTMLSelectElement
                            ).value as MaintenanceType;
                            const desc = (
                              document.getElementById(
                                "newDesc",
                              ) as HTMLInputElement
                            ).value;
                            if (!desc) return alert("Description obligatoire");
                            addMaintenance({ type, description: desc });
                            (
                              document.getElementById(
                                "newDesc",
                              ) as HTMLInputElement
                            ).value = "";
                          }}
                          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-md hover:bg-blue-700"
                        >
                          + Ajouter
                        </button>
                      </div>

                      {/* Liste avec scroll moderne */}
                      <ul className="scrollbar-thin scrollbar-thumb max-h-56 space-y-3 overflow-y-auto">
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
                                    className="w-36 rounded-md border border-gray-300 px-3 py-2 text-sm"
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
                                  <input
                                    value={editDesc}
                                    onChange={(e) =>
                                      setEditDesc(e.target.value)
                                    }
                                    className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        updateMaintenance({
                                          id: rec.id,
                                          type: editType,
                                          description: editDesc,
                                        });
                                        setEditingId(null);
                                      }}
                                      className="rounded-lg bg-green-800 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-green-900"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingId(null)}
                                      className="rounded-lg border border-gray-300 px-4 py-2 text-xs text-gray-600 hover:bg-gray-100"
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
                                      className="rounded p-1 hover:bg-blue-50"
                                      aria-label="Modifier"
                                    >
                                      <Edit2
                                        size={18}
                                        className="text-blue-600"
                                      />
                                    </button>
                                    <button
                                      onClick={() => setPendingDelete(rec)}
                                      className="rounded p-1 hover:bg-red-50"
                                      aria-label="Supprimer"
                                    >
                                      <Trash2
                                        size={18}
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
                    </section>
                    {/* Confirmation interne */}
                    {pendingDelete && (
                      <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30">
                        <div className="rounded-xl bg-white p-6 text-center shadow-lg ring-1 ring-gray-200">
                          <h3 className="mb-3 flex items-center justify-center gap-2 text-lg font-bold text-red-800">
                            <Trash2 size={20} /> Confirmer la suppression
                          </h3>
                          <p className="mb-5 text-sm text-gray-700">
                            Supprimer la maintenance « {pendingDelete.type} » ?
                          </p>
                          <div className="flex justify-center gap-4">
                            <button
                              onClick={() => setPendingDelete(null)}
                              className="rounded-lg border border-gray-300 px-5 py-2 text-sm hover:bg-gray-100"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() =>
                                deleteMaintenanceConfirmed(pendingDelete.id)
                              }
                              className="rounded-lg bg-red-800 px-5 py-2 text-sm font-semibold text-white hover:bg-red-900"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                      <button
                        onClick={() =>
                          window.confirm("Supprimer cet équipement ?") &&
                          deleteEquip()
                        }
                        className="rounded-lg bg-red-800 px-6 py-2 text-sm font-medium text-white hover:bg-red-900"
                      >
                        Supprimer
                      </button>
                      <button
                        onClick={saveEquip}
                        className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Enregistrer
                      </button>
                      <button
                        onClick={() => setShowModal(false)}
                        className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                      >
                        Fermer
                      </button>
                    </div>
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
