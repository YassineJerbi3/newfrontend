// src/app/bureaux/[id]/page.tsx
"use client";

import React, { useEffect, useState, FormEvent } from "react";
import { usePathname } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { FaDesktop, FaTrashAlt, FaPlus } from "react-icons/fa";

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
  type: string;
  famille: string;
  designation: string;
  etat: string;
  codeInventaire: string;
  numeroSerie: string;
  utilisateurs: { nom: string; prenom: string }[];
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

  // States pour le modal d'équipements
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedPoste, setSelectedPoste] = useState<Poste | null>(null);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);

  // Modes gestion des postes
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addMode, setAddMode] = useState(false);
  const [formQuantity, setFormQuantity] = useState(1);

  // Chargement et rafraîchissement des données
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

  // Ouvre la modal équipements d'un poste
  const openEquipmentModal = (poste: Poste) => {
    setSelectedPoste(poste);
    setShowEquipmentModal(true);
    fetch(`${API}/postes/${poste.id}/equipements`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data: Equipment[]) => setEquipmentList(data))
      .catch((err) => alert("Erreur chargement équipements : " + err.message));
  };

  // Ferme tout (modals et modes)
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

  // Ajout de postes en batch
  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!emplacement) return;
    const maxNumero = emplacement.postes.reduce(
      (m, p) => Math.max(m, p.numero),
      0,
    );
    const promises = [];
    for (let i = 1; i <= formQuantity; i++) {
      promises.push(
        fetch(`${API}/postes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ numero: maxNumero + i, emplacementId: id }),
          credentials: "include",
        }),
      );
    }
    Promise.all(promises)
      .then(() => {
        closeAll();
        fetchDetail();
      })
      .catch((err) => alert(err.message));
  };

  // Suppression multiple
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
                {emplacement.nom} — Postes
              </h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => setAddMode(true)}
                  className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
                >
                  <FaPlus className="mr-2" /> Ajouter
                </button>
                <button
                  onClick={toggleDeleteMode}
                  className={`flex items-center rounded-lg px-4 py-2 shadow ${
                    deleteMode
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <FaTrashAlt className="mr-2" />
                  {deleteMode ? "Annuler" : "Supprimer"}
                </button>
              </div>
            </div>

            {/* Grid des postes */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {emplacement.postes.map((poste) => (
                <div
                  key={poste.id}
                  onClick={() =>
                    deleteMode
                      ? handleSelect(poste.id)
                      : openEquipmentModal(poste)
                  }
                  className={`relative flex flex-col items-center rounded-2xl bg-white p-6 shadow-md hover:scale-105 hover:shadow-xl ${
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
                  <span className="text-xl font-semibold text-gray-800">
                    Poste {poste.numero}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions batch */}
            {deleteMode && (
              <div className="mt-6 text-right">
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.size === 0}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white shadow hover:bg-red-700 disabled:opacity-50"
                >
                  Supprimer ({selectedIds.size})
                </button>
              </div>
            )}

            {/* Add Modal */}
            {addMode && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={closeAll}
                />
                <form
                  onSubmit={handleAddSubmit}
                  className="relative z-10 w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-lg"
                >
                  <button
                    onClick={closeAll}
                    className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-800"
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
                    className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
                  >
                    Ajouter
                  </button>
                </form>
              </div>
            )}

            {/* Equipment Modal */}
            {selectedPoste && showEquipmentModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={closeAll}
                />
                <div className="relative z-10 max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-lg">
                  <button
                    onClick={closeAll}
                    className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-800"
                  >
                    &times;
                  </button>
                  <h2 className="mb-4 text-2xl font-bold text-gray-800">
                    Poste {selectedPoste.numero} — Détails
                  </h2>

                  {/* Utilisateurs en tête */}
                  {equipmentList.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold">Utilisateurs</h3>
                      <ul className="list-inside list-disc text-gray-700">
                        {Array.from(
                          new Set(
                            equipmentList.flatMap((eq) =>
                              eq.utilisateurs.map(
                                (u) => `${u.nom} ${u.prenom}`,
                              ),
                            ),
                          ),
                        ).map((fullName) => (
                          <li key={fullName}>{fullName}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sections ÉCRAN & UNITE_CENTRALE */}
                  {["ECRAN", "UNITE_CENTRALE"].map((sectionType) => {
                    const items = equipmentList.filter(
                      (eq) => eq.type === sectionType,
                    );
                    if (items.length === 0) return null;
                    return (
                      <div key={sectionType} className="mb-6">
                        <h3 className="mb-2 text-xl font-semibold">
                          {sectionType === "ECRAN" ? "Écran" : "Unité Centrale"}
                        </h3>
                        <div className="space-y-4">
                          {items.map((eq) => (
                            <div
                              key={eq.id}
                              className="rounded-lg border bg-gray-50 p-4 shadow-sm"
                            >
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
    </DefaultLayout>
  );
}
