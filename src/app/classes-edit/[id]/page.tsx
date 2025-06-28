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
  FaMicrochip,
  FaTv,
  FaUserTie,
  FaTimes,
  FaHashtag,
  FaBarcode,
  FaInfoCircle,
  FaTag,
  FaLayerGroup,
} from "react-icons/fa";

interface Poste {
  id: string;
  numero?: number; // devient optionnel
  label?: string; // nouveau champ
}
import EmplacementStats from "@/components/EmplacementStats";

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
        // Tri des postes numérotés
        data.postes.sort((a, b) => (a.numero ?? 0) - (b.numero ?? 0));

        // Vérifie s'il y a déjà un poste enseignant (numero===null)
        const hasProf = data.postes.some((p) => p.numero == null);

        // Si pas de professeur, on l'injecte, sinon on conserve la liste reçue
        const postesAvecProf = hasProf
          ? data.postes
          : [
              {
                id: "professor", // ou l'UUID réel si tu l'as
                label: "Poste Enseignant",
                numero: undefined,
              },
              ...data.postes,
            ];

        setEmplacement({
          ...data,
          postes: postesAvecProf,
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
              <h1 className="text-4xl font-extrabold text-gray-900">
                {emplacement.nom}
              </h1>
              <div className="flex items-center space-x-3">
                {/* Toggle Grid/List */}
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-lg p-2 transition ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title="Vue 2D"
                >
                  <FaTh size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded-lg p-2 transition ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title="Liste"
                >
                  <FaList size={20} />
                </button>

                {/* Actions */}
                <button
                  onClick={() => setAddMode(true)}
                  className="flex items-center space-x-1 rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
                >
                  <FaPlus /> <span>Ajouter</span>
                </button>
                <button
                  onClick={toggleDeleteMode}
                  className={`flex items-center space-x-1 rounded-lg px-4 py-2 transition ${
                    deleteMode
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FaTrashAlt />{" "}
                  <span>{deleteMode ? "Annuler" : "Supprimer"}</span>
                </button>
              </div>
            </div>
            {/* Ici par exemple, juste après le titre de la classe */}
            {emplacement && (
              <EmplacementStats
                emplacementId={emplacement.id}
                className="mb-8"
              />
            )}
            {/* Grid view */}
            {viewMode === "grid" ? (
              <>
                {/* Poste Enseignant centré */}
                <div className="mb-10 flex justify-center">
                  <div
                    className="flex cursor-pointer flex-col items-center space-y-3 rounded-3xl border-2 border-blue-500 bg-white p-8 shadow-lg transition-transform hover:scale-105"
                    onClick={() =>
                      openEquipmentModal(
                        emplacement.postes.find((p) => p.numero == null)!,
                      )
                    }
                  >
                    <FaDesktop className="text-blue-600" size={56} />
                    <span className="text-2xl font-semibold text-blue-700">
                      Poste Enseignant
                    </span>
                  </div>
                </div>

                {/* Autres postes */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {emplacement.postes
                    .filter((p) => p.numero != null)
                    .map((poste) => (
                      <div
                        key={poste.id}
                        onClick={() =>
                          deleteMode
                            ? handleSelect(poste.id)
                            : openEquipmentModal(poste)
                        }
                        className={`relative flex flex-col items-center space-y-4 rounded-2xl bg-white p-6 shadow-md transition-transform hover:scale-105 ${
                          deleteMode ? "cursor-pointer ring-2 ring-red-400" : ""
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
                        <FaDesktop className="text-gray-600" size={48} />
                        <span className="text-xl font-medium text-gray-800">
                          Poste {poste.numero}
                        </span>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              /* List view */
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Tous les équipements
                </h2>
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="border px-4 py-2 text-left">Type</th>
                      <th className="border px-4 py-2 text-left">Famille MI</th>
                      <th className="border px-4 py-2 text-left">État</th>
                      <th className="border px-4 py-2 text-left">Poste</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allEquipements.length > 0 ? (
                      allEquipements.map((eq, idx) => {
                        const poste = emplacement.postes.find(
                          (p) => p.id === eq.posteId,
                        );
                        return (
                          <tr
                            key={eq.id}
                            onClick={() => openEquipDetailModal(eq)}
                            className={`cursor-pointer transition hover:bg-blue-50 ${
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }`}
                          >
                            <td className="border px-4 py-2">
                              {eq.equipmentType}
                            </td>
                            <td className="border px-4 py-2">{eq.familleMI}</td>
                            <td className="border px-4 py-2">{eq.etat}</td>
                            <td className="border px-4 py-2">
                              {poste?.label ?? `Poste ${poste?.numero}`}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="border px-4 py-6 text-center text-gray-500"
                        >
                          Aucun équipement trouvé.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
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
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              onClick={closeAll}
            />

            {/* Modal */}
            <div className="fixed bottom-0 left-[300px] right-0 top-[90px] z-50 flex items-start justify-center overflow-y-auto p-6">
              <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-900 to-blue-600 p-6 text-white">
                  <h2 className="flex items-center text-2xl font-bold">
                    <FaDesktop className="mr-3" size={24} />
                    Détails du poste {selectedPoste.numero ?? "Enseignant"}
                  </h2>
                  <button
                    onClick={closeAll}
                    className="text-3xl transition hover:text-gray-200"
                  >
                    &times;
                  </button>
                </div>

                {/* Body */}
                <div className="space-y-8 p-6">
                  {/* Utilisateur */}
                  {equipmentList.length > 0 && (
                    <div className="flex items-center space-x-4 rounded-xl bg-blue-50 p-4 shadow-sm">
                      <FaUserTie className="text-blue-600" size={20} />
                      <div>
                        <label className="block text-sm font-medium text-blue-800">
                          Utilisateur
                        </label>
                        <p className="mt-1 text-gray-700">
                          {selectedPoste.label ? "ENSEIGNANT" : "ÉTUDIANT"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Sections Équipements côte à côte */}
                  <div className="grid grid-cols-2 gap-8">
                    {["ECRAN", "UNITE CENTRALE"].map((type) => {
                      const items = equipmentList.filter(
                        (e) => e.equipmentType === type,
                      );
                      if (!items.length) return null;
                      return (
                        <div key={type} className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {type === "ECRAN" ? "Écran" : "Unité Centrale"}
                          </h3>
                          <div className="space-y-4">
                            {items.map((eq) => (
                              <div
                                key={eq.id}
                                className="flex flex-col justify-between space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow transition hover:shadow-lg"
                              >
                                {/* Infos */}
                                <div className="flex items-center space-x-4">
                                  <div className="flex-shrink-0">
                                    {type === "ECRAN" ? (
                                      <FaTv
                                        className="text-blue-600"
                                        size={24}
                                      />
                                    ) : (
                                      <FaMicrochip
                                        className="text-blue-600"
                                        size={24}
                                      />
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                                    <div>
                                      <label className="font-medium text-blue-800">
                                        Famille MI
                                      </label>
                                      <p>{eq.familleMI || "—"}</p>
                                    </div>
                                    <div>
                                      <label className="font-medium text-blue-800">
                                        Désignation
                                      </label>
                                      <p>{eq.designation}</p>
                                    </div>
                                    <div>
                                      <label className="font-medium text-blue-800">
                                        État
                                      </label>
                                      <p>{eq.etat}</p>
                                    </div>
                                    <div>
                                      <label className="font-medium text-blue-800">
                                        Code Inv.
                                      </label>
                                      <p>{eq.codeInventaire}</p>
                                    </div>
                                    <div>
                                      <label className="font-medium text-blue-800">
                                        Série
                                      </label>
                                      <p>{eq.numeroSerie}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => handleDetachEquipment(eq.id)}
                                    className="flex items-center space-x-1 rounded-full border border-red-300 bg-red-50 px-3 py-1 text-red-600 transition hover:bg-red-100 hover:shadow-sm"
                                  >
                                    <FaTrash size={14} />
                                    <span className="text-xs">Détacher</span>
                                  </button>
                                  {selectedPoste.numero != null && (
                                    <button
                                      onClick={() => openReassignModal(eq)}
                                      className="flex items-center space-x-1 rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-blue-600 transition hover:bg-blue-100 hover:shadow-sm"
                                    >
                                      <FaEdit size={14} />
                                      <span className="text-xs">
                                        Réaffecter
                                      </span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-4 bg-gray-100 p-6">
                  {selectedPoste.label !== "Poste Enseignant" && (
                    <>
                      <button
                        onClick={handleDeletePoste}
                        className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-red-900 to-red-600 px-5 py-2 text-white transition hover:from-red-800 hover:to-red-500"
                      >
                        <FaTrash /> <span>Supprimer</span>
                      </button>
                      <button
                        onClick={openEditPoste}
                        className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-blue-900 to-blue-600 px-5 py-2 text-white transition hover:from-blue-800 hover:to-blue-500"
                      >
                        <FaEdit /> <span>Modifier</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Equipement Detail Modal */}
        {/* Equipement Detail Modal */}
        {/* Equipement Detail Modal */}
        {selectedEquipment && showEquipDetailModal && (
          <>
            {/* Overlay limité à la zone de contenu */}
            <div
              className="fixed bottom-0 left-[288.8px] right-0 top-[80px] z-50 bg-black/50 backdrop-blur-sm"
              onClick={closeEquipDetailModal}
            />

            {/* Modal */}
            <div className="fixed bottom-0 left-[288.8px] right-0 top-[80px] z-50 flex items-center justify-center px-8 py-12">
              <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between rounded-t-3xl bg-gradient-to-r from-blue-900 to-blue-600 p-6 text-white">
                  <div className="flex items-center space-x-3">
                    {selectedEquipment.equipmentType === "ECRAN" ? (
                      <FaTv size={28} />
                    ) : (
                      <FaMicrochip size={28} />
                    )}
                    <h2 className="text-2xl font-bold">
                      Détail {selectedEquipment.equipmentType.toLowerCase()}
                    </h2>
                  </div>
                  <button
                    onClick={closeEquipDetailModal}
                    className="text-3xl transition hover:text-gray-200"
                  >
                    &times;
                  </button>
                </div>

                {/* Body — 3 colonnes, pas de scroll */}
                <div className="grid grid-cols-1 gap-6 p-6 text-gray-700 md:grid-cols-3">
                  <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                    <FaLayerGroup className="text-blue-600" />
                    <div>
                      <span className="block text-sm font-medium text-gray-600">
                        Famille MI
                      </span>
                      <p className="mt-1 font-semibold text-gray-800">
                        {selectedEquipment.familleMI || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                    <FaTag className="text-green-600" />
                    <div>
                      <span className="block text-sm font-medium text-gray-600">
                        Désignation
                      </span>
                      <p className="mt-1 font-semibold text-gray-800">
                        {selectedEquipment.designation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                    <FaInfoCircle className="text-yellow-600" />
                    <div>
                      <span className="block text-sm font-medium text-gray-600">
                        État
                      </span>
                      <p className="mt-1 font-semibold text-gray-800">
                        {selectedEquipment.etat}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                    <FaBarcode className="text-purple-600" />
                    <div>
                      <span className="block text-sm font-medium text-gray-600">
                        Code Inventaire
                      </span>
                      <p className="mt-1 font-semibold text-gray-800">
                        {selectedEquipment.codeInventaire}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                    <FaHashtag className="text-indigo-600" />
                    <div>
                      <span className="block text-sm font-medium text-gray-600">
                        Numéro de série
                      </span>
                      <p className="mt-1 font-semibold text-gray-800">
                        {selectedEquipment.numeroSerie}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                    <FaDesktop className="text-teal-600" />
                    <div>
                      <span className="block text-sm font-medium text-gray-600">
                        Poste attribué
                      </span>
                      <p className="mt-1 font-semibold text-gray-800">
                        {(() => {
                          const poste = emplacement!.postes.find(
                            (p) => p.id === selectedEquipment.posteId,
                          );
                          return poste?.label ?? `Poste ${poste?.numero}`;
                        })() || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 rounded-b-3xl bg-gray-100 p-4">
                  {(selectedEquipment.equipmentType === "ECRAN" ||
                    selectedEquipment.equipmentType === "UNITE CENTRALE") && (
                    <button
                      onClick={() => {
                        closeEquipDetailModal();
                        openReassignModal(selectedEquipment);
                      }}
                      className="flex items-center space-x-1 rounded-full border border-blue-300 bg-blue-50 px-4 py-1 text-blue-600 transition hover:bg-blue-100"
                    >
                      <FaEdit size={14} />
                      <span className="text-sm">Réaffecter</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
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
                    .filter((p) => p.id !== reassignEquipment!.id) // pas son propre poste
                    // selon le type d’utilisateur de l’équipement :
                    .filter((p) => {
                      const isProf = p.numero == null;
                      const userType = reassignEquipment!.utilisateur; // "ENSEIGNANT" ou "ETUDIANT"
                      return userType === "ENSEIGNANT" ? isProf : !isProf;
                    })
                    // puis : ne proposer que ceux qui n’ont pas déjà ce type d’équipement
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
                        {p.label ?? `Poste ${p.numero}`}
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
      </div>
    </DefaultLayout>
  );
}
