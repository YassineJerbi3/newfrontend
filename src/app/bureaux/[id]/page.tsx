// src/app/bureaux/[id]/page.tsx
"use client";

import React, { useEffect, useState, FormEvent, useMemo } from "react";
import { usePathname } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {
  FaDesktop,
  FaTrashAlt,
  FaPlus,
  FaList,
  FaTh,
  FaTrash,
  FaEdit,
} from "react-icons/fa";

interface Poste {
  id: string;
  numero: number;
}

interface EmplacementDetail {
  id: string;
  nom: string;
  type: string;
  postes: Poste[];
}

interface Equipment {
  id: string;
  type: string; // ECRAN | UNITE_CENTRALE …
  famille: string;
  designation: string;
  etat: string;
  codeInventaire: string;
  numeroSerie: string;
  utilisateurs: { nom: string; prenom: string }[];
  posteId: string;
}

export default function BureauDetailPage() {
  const pathname = usePathname();
  const id = pathname.split("/").pop()!;
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";

  const [emplacement, setEmplacement] = useState<EmplacementDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // grid vs list
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // modal equipment
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedPoste, setSelectedPoste] = useState<Poste | null>(null);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  // tous les équipements de l’emplacement (pour le filtrage en réaffectation)
  const [allEquipements, setAllEquipements] = useState<Equipment[]>([]);

  // 1️⃣ Nouveaux états pour la réaffectation
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignEquipment, setReassignEquipment] = useState<Equipment | null>(
    null,
  );
  const [targetPosteId, setTargetPosteId] = useState<string | null>(null);

  // add / delete postes
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addMode, setAddMode] = useState(false);
  const [formQuantity, setFormQuantity] = useState(1);
  // pour la modale d’édition
  const [editPosteModal, setEditPosteModal] = useState(false);
  // pour le nouveau numéro
  const [newNumero, setNewNumero] = useState<number | null>(null);
  // Fetch postes + detail
  const fetchDetail = () => {
    setLoading(true);
    fetch(`${API}/emplacements/${id}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data: EmplacementDetail) => {
        data.postes.sort((a, b) => a.numero - b.numero);
        setEmplacement(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };
  useEffect(fetchDetail, [id]);
  // ouvrir la modale
  const openEditModal = (poste: Poste) => {
    setSelectedPoste(poste);
    setNewNumero(poste.numero);
    setEditPosteModal(true);
  };
  // soumettre l’édition
  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPoste || newNumero == null) return;
    try {
      const res = await fetch(`${API}/postes/${selectedPoste.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ numero: newNumero }),
      });
      const payload = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          // conflit de numéro
          alert(payload.message);
        } else {
          throw new Error(payload.message || "Erreur serveur");
        }
        return;
      }
      // succès
      setEditPosteModal(false);
      fetchDetail();
    } catch (err: any) {
      alert(err.message);
    }
  };
  // Open equipment modal for a poste
  const openEquipmentModal = (poste: Poste) => {
    setSelectedPoste(poste);
    setShowEquipmentModal(true);
    fetch(`${API}/postes/${poste.id}/equipements`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data: any[]) =>
        setEquipmentList(
          data.map((eq) => ({
            id: eq.id,
            type: eq.type,
            famille: eq.famille,
            designation: eq.designation,
            etat: eq.etat,
            codeInventaire: eq.codeInventaire,
            numeroSerie: eq.numeroSerie,
            utilisateurs: eq.utilisateurs ?? [],
            posteId: poste.id,
          })),
        ),
      )
      .catch((err) => alert("Erreur chargement équipements : " + err.message));
  };

  const closeAll = () => {
    setShowEquipmentModal(false);
    setSelectedPoste(null);
    setEquipmentList([]);
    setDeleteMode(false);
    setSelectedIds(new Set());
    setAddMode(false);
  };

  const toggleDeleteMode = () => {
    setDeleteMode((m) => !m);
    setSelectedIds(new Set());
  };
  const handleSelect = (pid: string) => {
    const s = new Set(selectedIds);
    s.has(pid) ? s.delete(pid) : s.add(pid);
    setSelectedIds(s);
  };

  // Add postes in batch
  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!emplacement) return;
    const maxNumero = emplacement.postes.reduce(
      (m, p) => Math.max(m, p.numero),
      0,
    );
    const promises = Array.from({ length: formQuantity }, (_, i) =>
      fetch(`${API}/postes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero: maxNumero + i + 1, emplacementId: id }),
        credentials: "include",
      }),
    );
    Promise.all(promises)
      .then(() => {
        closeAll();
        fetchDetail();
      })
      .catch((err) => alert(err.message));
  };

  // Batch delete
  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Supprimer ${selectedIds.size} poste(s) ?`)) return;
    Promise.all(
      Array.from(selectedIds).map((pid) =>
        fetch(`${API}/postes/${pid}`, {
          method: "DELETE",
          credentials: "include",
        }),
      ),
    ).then(() => {
      closeAll();
      fetchDetail();
    });
  };
  // 2️⃣ Handler pour détacher un équipement
  const handleDetachEquipment = (eqId: string) => {
    if (!selectedPoste) return;
    fetch(`${API}/postes/${selectedPoste.id}/equipements/${eqId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(() => setEquipmentList((list) => list.filter((e) => e.id !== eqId)))
      .catch((err) => alert("Erreur détachement : " + err.message));
  };

  // 3️⃣ Handler pour ouvrir la modale de réaffectation
  const openReassignModal = (eq: Equipment) => {
    setReassignEquipment(eq);
    setTargetPosteId(null);
    setShowReassignModal(true);
  };

  // 4️⃣ Confirmer la réaffectation côté backend
  const handleConfirmReassign = () => {
    if (!reassignEquipment || !targetPosteId) return;
    fetch(`${API}/equipements/${reassignEquipment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ posteId: targetPosteId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        // on recharge la modale et la liste
        if (selectedPoste) openEquipmentModal(selectedPoste);
      })
      .catch((err) => alert("Erreur réaffectation : " + err.message))
      .finally(() => setShowReassignModal(false));
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-6xl p-6">
        {loading && <p className="text-center text-gray-500">Chargement...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {emplacement && (
          <>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-4xl font-bold text-gray-900">
                {emplacement.nom}
              </h1>
              <div className="flex items-center space-x-2">
                {/* Grid / List toggle */}
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded p-2 ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                  title="Grille"
                >
                  <FaTh />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded p-2 ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                  title="Liste"
                >
                  <FaList />
                </button>

                {/* Add / Delete */}
                <button
                  onClick={() => setAddMode(true)}
                  className="flex items-center rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  <FaPlus className="mr-1" /> Ajouter
                </button>
                <button
                  onClick={toggleDeleteMode}
                  className={`flex items-center rounded px-4 py-2 ${
                    deleteMode
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  <FaTrashAlt className="mr-1" />
                  {deleteMode ? "Annuler" : "Supprimer"}
                </button>
              </div>
            </div>

            {/* View modes */}
            {viewMode === "grid" ? (
              // --- GRID ---
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {emplacement.postes.map((poste) => (
                  <div
                    key={poste.id}
                    onClick={() =>
                      deleteMode
                        ? handleSelect(poste.id)
                        : openEquipmentModal(poste)
                    }
                    className={`relative flex flex-col items-center rounded-2xl bg-white p-6 shadow-md transition hover:shadow-xl ${
                      deleteMode ? "cursor-pointer" : ""
                    }`}
                  >
                    {deleteMode && (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(poste.id)}
                        onChange={() => handleSelect(poste.id)}
                        className="absolute left-4 top-4 h-5 w-5 text-red-600"
                      />
                    )}
                    <FaDesktop size={48} className="mb-4 text-gray-600" />
                    <span className="text-xl font-semibold">
                      Poste {poste.numero}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              // --- LIST ---
              <table className="w-full table-auto border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Poste</th>
                    <th className="border p-2">Équipements</th>
                  </tr>
                </thead>
                <tbody>
                  {emplacement.postes.map((poste) => {
                    const count = equipmentList.filter(
                      (e) => e.posteId === poste.id,
                    ).length;
                    return (
                      <tr
                        key={poste.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => openEquipmentModal(poste)}
                      >
                        <td className="border p-2">Poste {poste.numero}</td>
                        <td className="border p-2">
                          {count > 0 ? `${count} équipement(s)` : "Aucun"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Batch delete */}
            {deleteMode && (
              <div className="mt-6 text-right">
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.size === 0}
                  className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Supprimer ({selectedIds.size})
                </button>
              </div>
            )}

            {/* Add Modal */}
            {addMode && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black/40"
                  onClick={closeAll}
                />
                <form
                  onSubmit={handleAddSubmit}
                  className="relative z-10 w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-lg"
                >
                  <button
                    onClick={closeAll}
                    className="absolute right-4 top-4 text-2xl text-gray-500"
                  >
                    &times;
                  </button>
                  <h2 className="text-2xl font-bold">Ajouter Postes</h2>
                  <label className="block">
                    Quantité
                    <input
                      type="number"
                      min={1}
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(+e.target.value)}
                      className="mt-1 w-full rounded border p-2"
                      required
                    />
                  </label>
                  <button
                    type="submit"
                    className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
                  >
                    Ajouter
                  </button>
                </form>
              </div>
            )}
            {/* Edit Poste Modal */}
            {editPosteModal && selectedPoste && (
              <div className="fixed inset-0 z-999 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setEditPosteModal(false)}
                />
                <form
                  onSubmit={handleEditSubmit}
                  className="relative z-10 w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-lg"
                >
                  <button
                    onClick={() => setEditPosteModal(false)}
                    className="absolute right-4 top-4 text-2xl text-gray-500"
                  >
                    &times;
                  </button>
                  <h2 className="text-2xl font-bold">Modifier Poste</h2>
                  <label className="block">
                    Nouveau numéro
                    <input
                      type="number"
                      value={newNumero ?? ""}
                      onChange={(e) => setNewNumero(+e.target.value)}
                      className="mt-1 w-full rounded border p-2"
                      required
                    />
                  </label>
                  <button
                    type="submit"
                    className="w-full rounded bg-green-600 py-2 text-white hover:bg-green-700"
                  >
                    Enregistrer
                  </button>
                </form>
              </div>
            )}

            {/* Equipment Modal */}
            {selectedPoste && showEquipmentModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black/40"
                  onClick={closeAll}
                />
                <div className="relative z-10 max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-lg">
                  <button
                    onClick={closeAll}
                    className="absolute right-4 top-4 text-2xl text-gray-500"
                  >
                    &times;
                  </button>
                  <h2 className="mb-4 text-2xl font-bold">
                    Poste {selectedPoste.numero} — Équipements
                  </h2>
                  {/* Modal Header Actions */}
                  <div className="mb-4 flex gap-2">
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Supprimer le poste ${selectedPoste!.numero} ?`,
                          )
                        ) {
                          fetch(`${API}/postes/${selectedPoste!.id}`, {
                            method: "DELETE",
                            credentials: "include",
                          }).then(() => {
                            closeAll();
                            fetchDetail();
                          });
                        }
                      }}
                      className="flex items-center rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                    >
                      <FaTrash className="mr-1" /> Supprimer Poste
                    </button>
                    <button
                      onClick={() => openEditModal(selectedPoste!)}
                      className="flex items-center rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                    >
                      <FaEdit className="mr-1" /> Modifier Poste
                    </button>
                  </div>

                  {/* Liste des utilisateurs */}
                  {equipmentList.length > 0 && (
                    <div className="mb-6">
                      <h3 className="mb-2 text-xl font-semibold">
                        Utilisateurs
                      </h3>
                      <ul className="list-inside list-disc text-gray-700">
                        {Array.from(
                          new Set(
                            equipmentList.flatMap((eq) =>
                              eq.utilisateurs.map(
                                (u) => `${u.nom} ${u.prenom}`,
                              ),
                            ),
                          ),
                        ).map((full) => (
                          <li key={full}>{full}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sections ECRAN & UNITE_CENTRALE */}
                  {["ECRAN", "UNITE CENTRALE"].map((section) => {
                    const items = equipmentList.filter(
                      (e) => e.type === section,
                    );
                    if (!items.length) return null;
                    return (
                      <div key={section} className="mb-6">
                        <h3 className="mb-2 text-xl font-semibold">
                          {section === "ECRAN" ? "Écran" : "Unité Centrale"}
                        </h3>
                        <div className="space-y-4">
                          {items.map((eq) => (
                            <div
                              key={eq.id}
                              className="relative rounded-lg border bg-gray-50 p-4 shadow-sm"
                            >
                              {/* ← Boutons Détacher & Réaffecter */}
                              <div className="absolute right-2 top-2 flex space-x-2">
                                <button
                                  onClick={() => handleDetachEquipment(eq.id)}
                                  title="Détacher de ce poste"
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <FaTrash />
                                </button>
                                <button
                                  onClick={() => openReassignModal(eq)}
                                  title="Réaffecter à un autre poste"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <FaEdit />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                                <div>
                                  <strong>Famille MI:</strong> {eq.famille}
                                </div>
                                <div>
                                  <strong>Désignation:</strong> {eq.designation}
                                </div>
                                <div>
                                  <strong>État:</strong> {eq.etat}
                                </div>
                                <div>
                                  <strong>Code Inventaire:</strong>{" "}
                                  {eq.codeInventaire}
                                </div>
                                <div>
                                  <strong>Numéro de série:</strong>{" "}
                                  {eq.numeroSerie}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {showReassignModal && reassignEquipment && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowReassignModal(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
            <button
              onClick={() => setShowReassignModal(false)}
              className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-800"
            >
              &times;
            </button>
            <h2 className="mb-4 text-2xl font-bold">Réaffecter l’équipement</h2>
            <label className="mb-4 block">
              Choisir un autre poste
              <select
                value={targetPosteId ?? ""}
                onChange={(e) => setTargetPosteId(e.target.value)}
                className="mt-1 w-full rounded border p-2"
              >
                <option value="" disabled>
                  -- sélectionnez un poste --
                </option>
                {emplacement!.postes
                  .filter((p) => p.id !== reassignEquipment.posteId)
                  .filter((p) => {
                    const types = allEquipements
                      .filter((e) => e.posteId === p.id)
                      .map((e) => e.equipmentType);
                    return !types.includes(reassignEquipment.type);
                  })
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      Poste {p.numero}
                    </option>
                  ))}
              </select>
            </label>
            <button
              onClick={handleConfirmReassign}
              disabled={!targetPosteId}
              className="w-full rounded bg-blue-600 py-2 text-white disabled:opacity-50"
            >
              Confirmer
            </button>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
}
