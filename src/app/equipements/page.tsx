// src/app/inventaire/equipement/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Edit2, Trash2 } from "lucide-react";

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

        {/* tableau */}
        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
          <table className="w-full table-fixed border-collapse text-left">
            <thead className="bg-blue-100">
              <tr>
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
                  <th key={h} className="px-4 py-2">
                    {h}
                  </th>
                ))}
              </tr>
              <tr>
                {/* filtres */}
                <th className="px-4 py-2">
                  <select
                    name="familleMI"
                    value={filters.familleMI}
                    onChange={handleFilterChange}
                    className="w-full rounded border p-1"
                  >
                    <option value="">Toutes</option>
                    {[...new Set(equipements.map((e) => e.familleMI))].map(
                      (v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ),
                    )}
                  </select>
                </th>
                <th className="px-4 py-2">
                  <input
                    name="designation"
                    value={filters.designation}
                    onChange={handleFilterChange}
                    placeholder="Filtrer…"
                    className="w-full rounded border p-1"
                  />
                </th>
                <th className="px-4 py-2">
                  <input
                    name="code"
                    value={filters.code}
                    onChange={handleFilterChange}
                    placeholder="Filtrer…"
                    className="w-full rounded border p-1"
                  />
                </th>
                <th className="px-4 py-2">
                  <input
                    name="numeroSerie"
                    value={filters.numeroSerie}
                    onChange={handleFilterChange}
                    placeholder="Filtrer…"
                    className="w-full rounded border p-1"
                  />
                </th>
                <th className="px-4 py-2">
                  <input
                    name="codeInventaire"
                    value={filters.codeInventaire}
                    onChange={handleFilterChange}
                    placeholder="Filtrer…"
                    className="w-full rounded border p-1"
                  />
                </th>
                <th className="px-4 py-2">
                  <input
                    type="date"
                    name="dateMiseService"
                    value={filters.dateMiseService}
                    onChange={handleFilterChange}
                    className="w-full rounded border p-1"
                  />
                </th>
                <th className="px-4 py-2">
                  <select
                    name="emplacement"
                    value={filters.emplacement}
                    onChange={handleFilterChange}
                    className="w-full rounded border p-1"
                  >
                    <option value="">Tous</option>
                    {emplacements.map((e) => (
                      <option key={e.id} value={e.nom}>
                        {e.nom}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="px-4 py-2">
                  <input
                    name="utilisateur"
                    value={filters.utilisateur}
                    onChange={handleFilterChange}
                    placeholder="Filtrer…"
                    className="w-full rounded border p-1"
                  />
                </th>
                <th className="px-4 py-2">
                  <select
                    name="etat"
                    value={filters.etat}
                    onChange={handleFilterChange}
                    className="w-full rounded border p-1"
                  >
                    <option value="">Tous</option>
                    {[...new Set(equipements.map((e) => e.etat))].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((eq) => (
                <tr
                  key={eq.id}
                  className="cursor-pointer even:bg-gray-50 hover:bg-blue-50"
                  onClick={() => openModal(eq.id)}
                >
                  <td className="px-4 py-2">{eq.familleMI}</td>
                  <td className="px-4 py-2">{eq.designation}</td>
                  <td className="px-4 py-2">{eq.code}</td>
                  <td className="px-4 py-2">{eq.numeroSerie}</td>
                  <td className="px-4 py-2">{eq.codeInventaire}</td>
                  <td className="px-4 py-2">{eq.dateMiseService}</td>
                  <td className="px-4 py-2">{eq.emplacement?.nom}</td>
                  <td className="px-4 py-2">
                    {eq.emplacement?.type === "BUREAU" && eq.user
                      ? `${eq.user.nom} ${eq.user.prenom}`
                      : eq.utilisateur}
                  </td>
                  <td className="px-4 py-2">{eq.etat}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    Aucune donnée trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && selectedEquip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="max-h-[80vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold text-blue-700">
                Détails de l’équipement
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {/* readonly */}
                {[
                  ["Famille MI", selectedEquip.familleMI],
                  ["Désignation", selectedEquip.designation],
                  ["Code", selectedEquip.code],
                  ["N° de série", selectedEquip.numeroSerie],
                  ["Code inv.", selectedEquip.codeInventaire],
                  ["Date service", selectedEquip.dateMiseService],
                ].map(([label, val]) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-sm font-medium text-gray-600">
                      {label}
                    </span>
                    <input
                      readOnly
                      value={val}
                      className="mt-1 w-full rounded border bg-gray-100 p-2 text-sm"
                    />
                  </div>
                ))}

                {/* UTILISATEUR */}
                <div className="col-span-2 flex flex-col">
                  <span className="text-sm font-medium text-gray-600">
                    Utilisateur *
                  </span>

                  {selectedEquip.emplacement?.type === "BUREAU" ? (
                    <select
                      value={selectedEquip.user?.id || ""}
                      onChange={(e) => {
                        const u =
                          bureauUsers.find((u) => u.id === e.target.value) ||
                          null;
                        setSelectedEquip({ ...selectedEquip, user: u });
                      }}
                      className="mt-1 rounded border p-2 text-sm"
                    >
                      <option value="">Sélectionner un utilisateur</option>
                      {bureauUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nom} {u.prenom}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={selectedEquip.utilisateur || ""}
                      onChange={(e) =>
                        setSelectedEquip({
                          ...selectedEquip,
                          utilisateur: e.target.value,
                        })
                      }
                      className="mt-1 rounded border p-2 text-sm"
                    >
                      <option value="ENSEIGNANT">ENSEIGNANT</option>
                      <option value="ETUDIANT">ETUDIANT</option>
                    </select>
                  )}
                </div>

                {/* ÉTAT */}
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-600">
                    État *
                  </span>
                  <select
                    value={selectedEquip.etat}
                    onChange={(e) =>
                      setSelectedEquip({
                        ...selectedEquip,
                        etat: e.target.value,
                      })
                    }
                    className="mt-1 rounded border p-2 text-sm"
                  >
                    <option value="FONCTIONNEL">FONCTIONNEL</option>
                    <option value="EN_PANNE">EN_PANNE</option>
                  </select>
                </div>

                {/* Emplacement */}
                <div className="col-span-2 flex flex-col">
                  <span className="text-sm font-medium text-gray-600">
                    Emplacement *
                  </span>
                  <select
                    value={selectedEquip.emplacement?.id || ""}
                    onChange={(e) => {
                      const emp =
                        emplacements.find((x) => x.id === e.target.value) ||
                        null;
                      setSelectedEquip({ ...selectedEquip, emplacement: emp });
                    }}
                    className="mt-1 rounded border p-2 text-sm"
                  >
                    <option value="">Aucun</option>
                    {emplacements.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* séparation */}
              <hr className="my-6 border-gray-300" />

              {/* Ajout maintenance préventive */}
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-medium text-gray-700">
                  Ajouter une maintenance préventive
                </h3>
                <div className="flex items-center space-x-2">
                  <select
                    id="newType"
                    className="rounded border p-2 text-sm"
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
                    className="flex-1 rounded border p-2 text-sm"
                  />
                  <button
                    onClick={() => {
                      const type = (
                        document.getElementById("newType") as HTMLSelectElement
                      ).value as MaintenanceType;
                      const desc = (
                        document.getElementById("newDesc") as HTMLInputElement
                      ).value;
                      if (!desc) return alert("Description obligatoire");
                      addMaintenance({ type, description: desc });
                      (
                        document.getElementById("newDesc") as HTMLInputElement
                      ).value = "";
                    }}
                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
                  >
                    + Ajouter
                  </button>
                </div>
              </div>

              {/* maintenance existante */}
              <div className="max-h-48 overflow-y-auto">
                <h3 className="mb-2 text-sm font-medium text-gray-700">
                  Maintenance préventive existante
                </h3>
                <ul className="space-y-2">
                  {selectedEquip.maintenanceRecords.map((rec) => {
                    const isEd = rec.id === editingId;
                    return (
                      <li
                        key={rec.id}
                        className="flex items-center space-x-2 text-sm"
                      >
                        {isEd ? (
                          <>
                            <select
                              value={editType}
                              onChange={(e) =>
                                setEditType(e.target.value as MaintenanceType)
                              }
                              className="w-32 rounded border p-1 text-sm"
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
                              onChange={(e) => setEditDesc(e.target.value)}
                              className="flex-1 rounded border p-2 text-sm"
                            />
                            <button
                              onClick={() => {
                                updateMaintenance({
                                  id: rec.id,
                                  type: editType,
                                  description: editDesc,
                                });
                                setEditingId(null);
                              }}
                              className="rounded bg-green-600 px-2 py-1 text-xs text-white"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded border px-2 py-1 text-xs"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="w-32">{rec.type}</span>
                            <span className="flex-1">{rec.description}</span>
                            <button
                              onClick={() => {
                                setEditingId(rec.id);
                                setEditType(rec.type);
                                setEditDesc(rec.description);
                              }}
                              className="rounded p-2 hover:bg-blue-100"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => setPendingDelete(rec)}
                              className="rounded p-2 hover:bg-red-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* confirmation suppression maintenance */}
              {pendingDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
                    <h3 className="mb-4 text-lg font-bold text-red-600">
                      Supprimer la maintenance ?
                    </h3>
                    <p className="mb-6">
                      Êtes‑vous sûr de vouloir supprimer la maintenance “
                      {pendingDelete.type}” ?
                    </p>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setPendingDelete(null)}
                        className="rounded border px-4 py-2"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() =>
                          deleteMaintenanceConfirmed(pendingDelete.id)
                        }
                        className="rounded bg-red-600 px-4 py-2 text-white"
                      >
                        Confirmer
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* footer */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() =>
                    window.confirm("Supprimer cet équipement ?") &&
                    deleteEquip()
                  }
                  className="rounded bg-red-600 px-4 py-2 text-sm text-white"
                >
                  Supprimer
                </button>
                <button
                  onClick={saveEquip}
                  className="rounded bg-blue-600 px-4 py-2 text-sm text-white"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded border px-4 py-2 text-sm"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
