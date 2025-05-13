// src/app/classes/[id]/page.tsx
"use client";

import React, { useEffect, useState, FormEvent, useMemo } from "react";
import { usePathname } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {
  FaDesktop,
  FaTrashAlt,
  FaPlus,
  FaExclamationTriangle,
  FaTrash,
  FaEdit,
  FaList,
  FaTh,
} from "react-icons/fa";

interface Poste {
  id: string;
  numero?: number; // devient optionnel
  label?: string; // nouveau champ
}

interface EmplacementDetail {
  id: string;
  nom: string;
  type: string;
  postes: Poste[];
}

interface Equipment {
  id: string;
  equipmentType: string; // au lieu de `type`

  familleMI: string;
  designation: string;
  etat: string;
  codeInventaire: string;
  numeroSerie: string;
  utilisateurs?: { nom: string; prenom: string }[]; // <-- optional
  posteId: string;
}

export default function ClasseDetailPage() {
  const pathname = usePathname();
  const id = pathname.split("/").pop()!;
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";

  const [emplacement, setEmplacement] = useState<EmplacementDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal & equipment state
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedPoste, setSelectedPoste] = useState<Poste | null>(null);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);

  // Poste management modes
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addMode, setAddMode] = useState(false);
  const [formQuantity, setFormQuantity] = useState(1);

  // Edit poste modal state
  const [editPosteModal, setEditPosteModal] = useState(false);
  const [newNumero, setNewNumero] = useState(0);

  // vue d’affichage : "grid" ou "list"
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // tous les équipements de l’emplacement
  const [allEquipements, setAllEquipements] = useState<Equipment[]>([]);
  // Équipement sélectionné pour la modal de détail
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null,
  );
  const [showEquipDetailModal, setShowEquipDetailModal] = useState(false);
  // État pour la modal de réaffectation
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignEquipment, setReassignEquipment] = useState<Equipment | null>(
    null,
  );
  const [targetPosteId, setTargetPosteId] = useState<string | null>(null);

  // Ouvre la modal de détail d'un équipement
  const openEquipDetailModal = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setShowEquipDetailModal(true);
  };

  // Ferme la modal de détail
  const closeEquipDetailModal = () => {
    setSelectedEquipment(null);
    setShowEquipDetailModal(false);
  };

  // Fetch emplacement + postes + allEquipements
  const fetchDetail = () => {
    setLoading(true);
    // 1) Emplacement + postes
    fetch(`${API}/emplacements/${id}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data: EmplacementDetail) => {
        // 1.a) Trie les postes par numéro (ignore le prof s'il n'a pas de numero)
        data.postes.sort((a, b) => (a.numero ?? 0) - (b.numero ?? 0));

        // 1.b) Injecte le Poste Professeur en tête
        const profPoste: Poste = {
          id: "professor", // ou l'UUID réel si tu l'as en base
          label: "Poste Professeur",
          // numero laissé undefined
        };
        const withProf = [profPoste, ...data.postes];

        // 1.c) Mets à jour le state
        setEmplacement({
          ...data,
          postes: withProf,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    // 2) Tous les équipements de l’emplacement
    fetch(`${API}/equipements?emplacementId=${id}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data: any) => {
        const list: Equipment[] = Array.isArray(data)
          ? data
          : Array.isArray(data.equipements)
            ? data.equipements
            : [];
        setAllEquipements(list);
      })
      .catch(() => setAllEquipements([]))
      .finally(() => setLoading(false));
  };

  useEffect(fetchDetail, [id]);

  // Open Equipment Modal for a specific poste
  const openEquipmentModal = (poste: Poste) => {
    setSelectedPoste(poste);
    setShowEquipmentModal(true);

    fetch(`${API}/postes/${poste.id}/equipements`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data: any[]) => {
        // on mappe les clés du back vers notre interface Equipment
        const mapped: Equipment[] = data.map((eq) => ({
          id: eq.id,
          equipmentType: eq.type,
          familleMI: eq.famille,
          designation: eq.marque,
          etat: eq.etat,
          codeInventaire: eq.codeInterne,
          numeroSerie: eq.numeroSerie,
          utilisateurs: eq.utilisateurs ?? [],
          posteId: poste.id,
        }));
        setEquipmentList(mapped);
      })
      .catch((err) => alert("Erreur chargement équipements : " + err.message));
  };

  // Close all modals/modes
  const closeAll = () => {
    setShowEquipmentModal(false);
    setEditPosteModal(false);
    setSelectedPoste(null);
    setEquipmentList([]);
    setDeleteMode(false);
    setSelectedIds(new Set());
    setAddMode(false);
  };

  // Toggle delete mode for postes
  const toggleDeleteMode = () => {
    setDeleteMode((m) => !m);
    setSelectedIds(new Set());
  };
  const handleSelect = (pid: string) => {
    const s = new Set(selectedIds);
    s.has(pid) ? s.delete(pid) : s.add(pid);
    setSelectedIds(s);
  };

  // Remplace ton handleAddSubmit par ceci :
  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!emplacement) return;

    // 1) Ne garder que les postes numérotés
    const numbered = emplacement.postes
      .map((p) => p.numero)
      .filter((n): n is number => typeof n === "number");

    // 2) Calculer le numéro max (0 si aucun poste numéroté)
    const maxNumero = numbered.length > 0 ? Math.max(...numbered) : 0;

    // 3) Créer formQuantity postes à la suite
    const promises = Array.from({ length: formQuantity }, (_, i) =>
      fetch(`${API}/postes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          numero: maxNumero + 1 + i,
          emplacementId: id,
        }),
      }),
    );

    Promise.all(promises)
      .then(() => {
        closeAll();
        fetchDetail();
      })
      .catch((err) => alert(err.message));
  };

  // Batch delete postes
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

  // Delete one equipment from this poste
  const handleDetachEquipment = (eqId: string) => {
    if (!selectedPoste) return;
    fetch(`${API}/postes/${selectedPoste.id}/equipements/${eqId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(() => setEquipmentList((list) => list.filter((e) => e.id !== eqId)))
      .catch((err) => alert(err.message));
  };

  // Reassign equipment to another poste
  // Ouvre la modal de réaffectation
  const openReassignModal = (eq: Equipment) => {
    setReassignEquipment(eq);
    setTargetPosteId(null);
    setShowReassignModal(true);
  };

  // Confirme la réaffectation
  const handleConfirmReassign = () => {
    if (!reassignEquipment || !targetPosteId) return;
    fetch(`${API}/equipements/${reassignEquipment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ posteId: targetPosteId }),
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        // on recharge la modal courante
        if (selectedPoste) openEquipmentModal(selectedPoste);
      })
      .catch((err) => alert("Erreur réaffectation : " + err.message))
      .finally(() => setShowReassignModal(false));
  };

  // Delete the entire selectedPoste
  const handleDeletePoste = () => {
    if (!selectedPoste) return;
    if (!confirm(`Supprimer le poste ${selectedPoste.numero} ?`)) return;
    fetch(`${API}/postes/${selectedPoste.id}`, {
      method: "DELETE",
      credentials: "include",
    }).then(() => {
      closeAll();
      fetchDetail();
    });
  };

  // Open edit-poste modal
  const openEditPoste = () => {
    if (!selectedPoste) return;
    setNewNumero(selectedPoste.numero);
    setEditPosteModal(true);
  };
  const handleEditPoste = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPoste) return;
    fetch(`${API}/postes/${selectedPoste.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero: newNumero }),
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
      })
      .then(() => {
        closeAll();
        fetchDetail();
      })
      .catch((err) => alert(err.message));
  };
  // Dès que emplacement est chargé, on prépare un map id→numero
  const posteNumById = useMemo(() => {
    if (!emplacement) return {};
    return Object.fromEntries(emplacement.postes.map((p) => [p.id, p.numero]));
  }, [emplacement]);
  const TILE_WIDTH = "w-60"; // <- largeur des tuiles
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
                {/* 2D (grid) */}
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded p-2 ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  title="Vue 2D"
                >
                  <FaTh />
                </button>

                {/* Liste */}
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded p-2 ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  title="Liste des équipements"
                >
                  <FaList />
                </button>

                {/* Ajouter */}
                <button
                  onClick={() => setAddMode(true)}
                  className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  <FaPlus className="mr-2" /> Ajouter
                </button>

                {/* Supprimer */}
                <button
                  onClick={toggleDeleteMode}
                  className={`flex items-center rounded-lg px-4 py-2 hover:bg-gray-300 ${
                    deleteMode
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  <FaTrashAlt className="mr-2" />
                  {deleteMode ? "Annuler" : "Supprimer"}
                </button>
              </div>
            </div>

            {/* Grid des postes */}
            {viewMode === "grid" ? (
              <>
                {/* 1) Poste Enseignant isolé */}
                {emplacement.postes
                  .filter((p) => p.numero == null)
                  .map((prof) => (
                    <div
                      key={prof.id}
                      onClick={() => openEquipmentModal(prof)}
                      className={`
            relative mx-auto mb-6 flex 
            cursor-pointer flex-col items-center rounded-2xl 
            border-2 border-blue-500 p-6 shadow-lg transition hover:scale-105
            ${TILE_WIDTH}
          `}
                    >
                      <FaDesktop size={48} className="mb-4 text-blue-500" />
                      <span className="text-xl font-semibold text-blue-700">
                        Poste Enseignant
                      </span>
                    </div>
                  ))}

                {/* 2) Les autres postes numérotés en grille */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {emplacement.postes
                    .filter((p) => p.numero != null)
                    .map((poste) => {
                      const eqTypes = equipmentList
                        .filter((e) => e.posteId === poste.id)
                        .map((e) => e.equipmentType);
                      const missing =
                        !eqTypes.includes("ECRAN") ||
                        !eqTypes.includes("UNITE CENTRALE");
                      return (
                        <div
                          key={poste.id}
                          onClick={() =>
                            deleteMode
                              ? handleSelect(poste.id)
                              : openEquipmentModal(poste)
                          }
                          className={`
                relative flex flex-col items-center 
                rounded-2xl bg-white p-6 shadow-md 
                transition hover:scale-105
                ${deleteMode ? "cursor-pointer" : ""}
                ${TILE_WIDTH}
              `}
                        >
                          {missing && (
                            <FaExclamationTriangle
                              size={24}
                              className="absolute right-3 top-3 text-yellow-500"
                            />
                          )}
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
                      );
                    })}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Tous les équipements</h2>
                <table className="w-full table-auto border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">Type</th>
                      <th className="border px-2 py-1">Famille MI</th>
                      <th className="border px-2 py-1">État</th>
                      <th className="border px-2 py-1">Poste</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allEquipements.length > 0 ? (
                      allEquipements.map((eq) => (
                        <tr
                          key={eq.id}
                          onClick={() => openEquipDetailModal(eq)}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <td className="border px-2 py-1">
                            {eq.equipmentType}
                          </td>
                          <td className="border px-2 py-1">{eq.familleMI}</td>
                          <td className="border px-2 py-1">{eq.etat}</td>
                          <td className="border px-2 py-1">
                            {posteNumById[eq.posteId] != null
                              ? `Poste ${posteNumById[eq.posteId]}`
                              : "Aucun poste"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="border px-2 py-4 text-center text-gray-500"
                        >
                          Aucun équipement trouvé.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Batch delete */}
            {deleteMode && (
              <div className="mt-6 text-right">
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.size === 0}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Supprimer ({selectedIds.size})
                </button>
              </div>
            )}

            {/* Add Modal */}
            {addMode && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={closeAll}
                />
                <form
                  onSubmit={handleAddSubmit}
                  className="relative z-10 w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
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
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={closeAll}
                />
                <div className="relative z-10 max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
                  <button
                    onClick={closeAll}
                    className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-800"
                  >
                    &times;
                  </button>
                  <h2 className="mb-4 text-2xl font-bold text-gray-800">
                    Poste {selectedPoste.numero} — Détails
                  </h2>

                  {/* Poste actions */}
                  <div className="mb-4 flex gap-2">
                    <button
                      onClick={handleDeletePoste}
                      className="flex items-center rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                    >
                      <FaTrash className="mr-1" />
                      Supprimer Poste
                    </button>
                    <button
                      onClick={openEditPoste}
                      className="flex items-center rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                    >
                      <FaEdit className="mr-1" />
                      Modifier Poste
                    </button>
                  </div>

                  {/* Edit poste modal */}
                  {editPosteModal && (
                    <form
                      onSubmit={handleEditPoste}
                      className="mb-6 space-y-4 rounded border bg-gray-100 p-4"
                    >
                      <label className="block">
                        Nouveau numéro
                        <input
                          type="number"
                          value={newNumero}
                          onChange={(e) => setNewNumero(+e.target.value)}
                          className="mt-1 w-full rounded border p-2"
                          required
                        />
                      </label>
                      <button
                        type="submit"
                        className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                      >
                        Enregistrer
                      </button>
                    </form>
                  )}

                  {/* Utilisateurs */}
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
                        ).map((fullName) => (
                          <li key={fullName}>{fullName}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sections ÉCRAN & UNITE CENTRALE */}
                  {["ECRAN", "UNITE CENTRALE"].map((sectionType) => {
                    const items = equipmentList.filter(
                      (eq) => eq.equipmentType === sectionType,
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
                              className="relative rounded-lg border bg-gray-50 p-4 shadow-sm"
                            >
                              {/* Equipment actions */}
                              <div className="absolute right-2 top-2 flex gap-2">
                                <button
                                  onClick={() => handleDetachEquipment(eq.id)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Détacher de ce poste"
                                >
                                  <FaTrash />
                                </button>
                                <button
                                  onClick={() => openReassignModal(eq)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Réaffecter à un autre poste"
                                >
                                  <FaEdit />
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                                <div>
                                  <strong>Famille MI:</strong> {eq.familleMI}
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
            {/* Equipement Detail Modal */}
            {selectedEquipment && showEquipDetailModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={closeEquipDetailModal}
                />
                <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                  {/* Header */}
                  <div className="mb-4 flex items-center justify-between border-b pb-2">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Détail de l’équipement
                    </h2>
                    <button
                      onClick={closeEquipDetailModal}
                      className="text-2xl text-gray-500 hover:text-gray-800"
                    >
                      &times;
                    </button>
                  </div>

                  {/* Corps */}
                  <div className="space-y-3 text-gray-700">
                    <div>
                      <strong>Type :</strong> {selectedEquipment.equipmentType}
                    </div>
                    <div>
                      <strong>Famille MI :</strong>{" "}
                      {selectedEquipment.familleMI || "—"}
                    </div>
                    <div>
                      <strong>Désignation :</strong>{" "}
                      {selectedEquipment.designation}
                    </div>
                    <div>
                      <strong>État :</strong> {selectedEquipment.etat}
                    </div>
                    <div>
                      <strong>Code Inventaire :</strong>{" "}
                      {selectedEquipment.codeInventaire}
                    </div>
                    <div>
                      <strong>Numéro de série :</strong>{" "}
                      {selectedEquipment.numeroSerie}
                    </div>
                    <div>
                      <strong>Poste :</strong>{" "}
                      {posteNumById[selectedEquipment.posteId] != null
                        ? `Poste ${posteNumById[selectedEquipment.posteId]}`
                        : "Aucun poste"}
                    </div>
                    {(selectedEquipment.utilisateurs ?? []).length > 0 && (
                      <div>
                        <strong>Utilisateurs :</strong>{" "}
                        {Array.from(
                          new Set(
                            (selectedEquipment.utilisateurs ?? []).map(
                              (u) => `${u.nom} ${u.prenom}`,
                            ),
                          ),
                        ).join(", ")}
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  {(selectedEquipment.equipmentType === "ECRAN" ||
                    selectedEquipment.equipmentType === "UNITE CENTRALE") && (
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => {
                          closeEquipDetailModal();
                          openReassignModal(selectedEquipment);
                        }}
                        className="flex items-center rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                      >
                        <FaEdit className="mr-1" />
                        Réaffecter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reassign Modal */}
            {showReassignModal && reassignEquipment && (
              <div className="fixed inset-0 z-999 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={() => setShowReassignModal(false)}
                />
                <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                  <button
                    onClick={() => setShowReassignModal(false)}
                    className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-800"
                  >
                    &times;
                  </button>
                  <h2 className="mb-4 text-2xl font-bold">
                    Réaffecter l’équipement
                  </h2>
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
                        .filter((p) => p.id !== reassignEquipment!.posteId)
                        .filter((p) => {
                          const typesOnThatPoste = allEquipements
                            .filter((e) => e.posteId === p.id)
                            .map((e) => e.equipmentType);
                          return !typesOnThatPoste.includes(
                            reassignEquipment!.equipmentType,
                          );
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
          </>
        )}
      </div>
    </DefaultLayout>
  );
}
