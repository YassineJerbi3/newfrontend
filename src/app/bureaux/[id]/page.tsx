// src/app/bureaux/[id]/page.tsx
"use client";

import React, { useEffect, useState, FormEvent } from "react";
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
  FaUserTie,
  FaTv,
  FaMicrochip,
  FaTimes,
  FaLayerGroup,
  FaTag,
  FaInfoCircle,
  FaBarcode,
  FaHashtag,
} from "react-icons/fa";
import EmplacementStats from "@/components/EmplacementStats";

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
  familleMI: string;
  designation: string;
  etat: string;
  codeInventaire: string;
  numeroSerie: string;
  user: { nom: string; prenom: string } | null;
  posteId: string;
}

export default function BureauDetailPage() {
  const pathname = usePathname();
  const id = pathname.split("/").pop()!;
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";

  const [emplacement, setEmplacement] = useState<EmplacementDetail | null>(
    null,
  );
  const [allEquipements, setAllEquipements] = useState<Equipment[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [selectedPoste, setSelectedPoste] = useState<Poste | null>(null);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null,
  );
  const [showEquipDetailModal, setShowEquipDetailModal] = useState(false);

  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignEquipment, setReassignEquipment] = useState<Equipment | null>(
    null,
  );
  const [targetPosteId, setTargetPosteId] = useState<string | null>(null);

  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addMode, setAddMode] = useState(false);
  const [formQuantity, setFormQuantity] = useState(1);
  const [editPosteModal, setEditPosteModal] = useState(false);
  const [newNumero, setNewNumero] = useState<number | null>(null);

  const openEquipDetailModal = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setShowEquipDetailModal(true);
  };
  const closeEquipDetailModal = () => {
    setSelectedEquipment(null);
    setShowEquipDetailModal(false);
  };

  const fetchDetail = () => {
    setLoading(true);
    setError(null);

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

    fetch(`${API}/equipements?emplacementId=${id}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data: any[]) => {
        setAllEquipements(
          data.map((eq) => ({
            id: eq.id,
            type: eq.equipmentType,
            familleMI: eq.familleMI,
            designation: eq.designation,
            etat: eq.etat,
            codeInventaire: eq.codeInventaire,
            numeroSerie: eq.numeroSerie,
            user: eq.user ? { nom: eq.user.nom, prenom: eq.user.prenom } : null,
            posteId: eq.posteId || "",
          })),
        );
      })
      .catch(() => setAllEquipements([]));
  };
  useEffect(fetchDetail, [id]);

  const openEquipmentModal = (poste: Poste) => {
    setSelectedPoste(poste);
    setShowEquipmentModal(true);

    // src/app/bureaux/[id]/page.tsx
    // … inside openEquipmentModal(poste):
    fetch(`${API}/postes/${poste.id}/equipements`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data: any[]) => {
        console.log("💡 raw poste equipements[0] →", data[0]);

        console.log("postes equipements →", data); // debug to confirm shape
        const mapped = data.map((eq) => ({
          id: eq.id,
          type: eq.equipmentType,
          familleMI: eq.familleMI,
          designation: eq.designation,
          etat: eq.etat,
          codeInventaire: eq.codeInventaire,
          numeroSerie: eq.numeroSerie,
          user: eq.user ? { nom: eq.user.nom, prenom: eq.user.prenom } : null,
          posteId: poste.id,
        }));
        console.log("⟡ fetched for poste", poste.numero, mapped);

        setEquipmentList(mapped);
      })
      .catch((err) => alert("Erreur chargement équipements : " + err.message));
  };
  const closeAll = () => {
    setShowEquipmentModal(false);
    setSelectedPoste(null);
    setEquipmentList([]);
    setDeleteMode(false);
    setSelectedIds(new Set());
    setAddMode(false);
    setShowEquipDetailModal(false);
    setSelectedEquipment(null);
    setShowReassignModal(false);
    setReassignEquipment(null);
    setTargetPosteId(null);
    setEditPosteModal(false);
    setNewNumero(null);
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

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!emplacement) return;
    const maxNumero = emplacement.postes.reduce(
      (m, p) => Math.max(m, p.numero),
      0,
    );
    Promise.all(
      Array.from({ length: formQuantity }, (_, i) =>
        fetch(`${API}/postes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            numero: maxNumero + i + 1,
            emplacementId: id,
          }),
        }),
      ),
    )
      .then(() => {
        closeAll();
        fetchDetail();
      })
      .catch((err) => alert(err.message));
  };

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

  const openEditModal = (poste: Poste) => {
    setSelectedPoste(poste);
    setNewNumero(poste.numero);
    setEditPosteModal(true);
  };
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
        if (res.status === 409) alert(payload.message);
        else throw new Error(payload.message || "Erreur serveur");
        return;
      }
      setEditPosteModal(false);
      fetchDetail();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDetachEquipment = (eqId: string) => {
    if (!selectedPoste) return;
    fetch(`${API}/postes/${selectedPoste.id}/equipements/${eqId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(() => setEquipmentList((list) => list.filter((e) => e.id !== eqId)))
      .catch((err) => alert("Erreur détachement : " + err.message));
  };

  const openReassignModal = (eq: Equipment) => {
    setReassignEquipment(eq);
    setTargetPosteId(null);
    setShowReassignModal(true);
  };
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
        if (selectedPoste) openEquipmentModal(selectedPoste);
      })
      .catch((err) => alert("Erreur réaffectation : " + err.message))
      .finally(() => setShowReassignModal(false));
  };

  const handleDeletePoste = () => {
    if (!selectedPoste) return;
    if (!confirm(`Supprimer le poste ${selectedPoste.numero} ?`)) return;
    fetch(`${API}/postes/${selectedPoste.id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        closeAll();
        fetchDetail();
      })
      .catch((err) => alert(err.message));
  };

  const openEditPoste = () => {
    if (!selectedPoste) return;
    setNewNumero(selectedPoste.numero);
    setEditPosteModal(true);
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
              <h1 className="text-4xl font-extrabold text-gray-900">
                {emplacement.nom}
              </h1>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-lg p-2 transition ${viewMode === "grid" ? "bg-blue-600 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  title="Vue Grille"
                >
                  <FaTh size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded-lg p-2 transition ${viewMode === "list" ? "bg-blue-600 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  title="Vue Liste"
                >
                  <FaList size={20} />
                </button>
                <button
                  onClick={() => setAddMode(true)}
                  className="flex items-center space-x-1 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  <FaPlus />
                  <span>Ajouter</span>
                </button>
                <button
                  onClick={toggleDeleteMode}
                  className={`flex items-center space-x-1 rounded-lg px-4 py-2 transition ${deleteMode ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  <FaTrashAlt />
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
            {/* GRID or LIST */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {emplacement.postes.map((poste) => (
                  <div
                    key={poste.id}
                    onClick={() =>
                      deleteMode
                        ? handleSelect(poste.id)
                        : openEquipmentModal(poste)
                    }
                    className={`relative flex cursor-pointer flex-col items-center space-y-4 rounded-2xl bg-white p-6 shadow-md transition-transform hover:scale-105 ${deleteMode ? "ring-2 ring-red-400" : ""}`}
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
            ) : (
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
                      <th className="border px-4 py-2 text-left">
                        Utilisateur
                      </th>
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
                            className={`cursor-pointer transition hover:bg-blue-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                          >
                            <td className="border px-4 py-2">{eq.type}</td>
                            <td className="border px-4 py-2">{eq.familleMI}</td>
                            <td className="border px-4 py-2">{eq.etat}</td>
                            <td className="border px-4 py-2">
                              {poste ? `Poste ${poste.numero}` : "—"}
                            </td>
                            <td className="border px-4 py-2">
                              {eq.user
                                ? `${eq.user.nom} ${eq.user.prenom}`
                                : "—"}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
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

            {addMode && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={closeAll}
                />
                <form
                  onSubmit={handleAddSubmit}
                  className="relative z-10 w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-xl"
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

            {editPosteModal && selectedPoste && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={() => setEditPosteModal(false)}
                />
                <form
                  onSubmit={handleEditSubmit}
                  className="relative z-10 w-full max-w-sm space-y-4 rounded-3xl bg-white p-6 shadow-xl"
                >
                  <button
                    onClick={() => setEditPosteModal(false)}
                    className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-800"
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
                    className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
                  >
                    Enregistrer
                  </button>
                </form>
              </div>
            )}

            {/* -- Equipment Modal (un seul bloc, version "Classes") -- */}
            {selectedPoste && showEquipmentModal && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
                  onClick={closeAll}
                />
                <div className="fixed bottom-0 left-[300px] right-0 top-[90px] z-50 flex items-start justify-center overflow-y-auto p-6">
                  <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                    <div className="flex items-center justify-between bg-gradient-to-r from-blue-900 to-blue-600 p-6 text-white">
                      <h2 className="flex items-center text-2xl font-bold">
                        <FaDesktop className="mr-3" size={24} /> Détails du
                        poste {selectedPoste.numero}
                      </h2>
                      <button
                        onClick={closeAll}
                        className="text-3xl hover:text-gray-200"
                      >
                        &times;
                      </button>
                    </div>
                    <div className="space-y-8 p-6">
                      {equipmentList.length > 0 && (
                        <div className="flex items-center space-x-4 rounded-xl bg-blue-50 p-4 shadow-sm">
                          <FaUserTie className="text-blue-600" size={20} />
                          <div>
                            <label className="block text-sm font-medium text-blue-800">
                              Utilisateur
                            </label>
                            <p className="mt-1 text-gray-700">
                              {equipmentList
                                .map((eq) =>
                                  eq.user
                                    ? `${eq.user.nom} ${eq.user.prenom}`
                                    : "–",
                                )
                                .join(", ")}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-8">
                        {["ECRAN", "UNITE CENTRALE"].map((type) => {
                          const items = equipmentList.filter(
                            (e) => e.type === type,
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
                                    className="relative flex flex-col justify-between space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow transition hover:shadow-lg"
                                  >
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
                                    <div className="flex justify-end space-x-2">
                                      <button
                                        onClick={() =>
                                          handleDetachEquipment(eq.id)
                                        }
                                        className="flex items-center space-x-1 rounded-full border border-red-300 bg-red-50 px-3 py-1 text-red-600 hover:bg-red-100"
                                      >
                                        <FaTrash size={14} />
                                        <span className="text-xs">
                                          Détacher
                                        </span>
                                      </button>
                                      <button
                                        onClick={() => openReassignModal(eq)}
                                        className="flex items-center space-x-1 rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-blue-600 hover:bg-blue-100"
                                      >
                                        <FaEdit size={14} />
                                        <span className="text-xs">
                                          Réaffecter
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex justify-end gap-4 bg-gray-100 p-6">
                      <button
                        onClick={handleDeletePoste}
                        className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-red-900 to-red-600 px-5 py-2 text-white hover:from-red-800 hover:to-red-500"
                      >
                        <FaTrash /> <span>Supprimer</span>
                      </button>
                      <button
                        onClick={openEditPoste}
                        className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-blue-900 to-blue-600 px-5 py-2 text-white hover:from-blue-800 hover:to-blue-500"
                      >
                        <FaEdit /> <span>Modifier</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {selectedEquipment && showEquipDetailModal && (
              <>
                <div
                  className="fixed bottom-0 left-[288.8px] right-0 top-[80px] z-50 bg-black/50 backdrop-blur-sm"
                  onClick={closeEquipDetailModal}
                />
                <div className="fixed bottom-0 left-[288.8px] right-0 top-[80px] z-50 flex items-center justify-center px-8 py-12">
                  <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl">
                    <div className="flex items-center justify-between rounded-t-3xl bg-gradient-to-r from-blue-900 to-blue-600 p-6 text-white">
                      <div className="flex items-center space-x-3">
                        {selectedEquipment.type === "ECRAN" ? (
                          <FaTv size={28} />
                        ) : (
                          <FaMicrochip size={28} />
                        )}
                        <h2 className="text-2xl font-bold">
                          Détail {selectedEquipment.type.toLowerCase()}
                        </h2>
                      </div>
                      <button
                        onClick={closeEquipDetailModal}
                        className="text-3xl hover:text-gray-200"
                      >
                        <FaTimes />
                      </button>
                    </div>
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
                        <FaUserTie className="text-teal-600" />
                        <div>
                          <span className="block text-sm font-medium text-gray-600">
                            Utilisateur
                          </span>
                          <p className="mt-1 font-semibold text-gray-800">
                            {selectedEquipment.user
                              ? `${selectedEquipment.user.nom} ${selectedEquipment.user.prenom}`
                              : "–"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {(selectedEquipment.type === "ECRAN" ||
                      selectedEquipment.type === "UNITE CENTRALE") && (
                      <div className="flex justify-end gap-4 rounded-b-3xl bg-gray-100 p-6">
                        <button
                          onClick={() => {
                            closeEquipDetailModal();
                            openReassignModal(selectedEquipment);
                          }}
                          className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-blue-900 to-blue-600 px-5 py-2 text-white hover:from-blue-800 hover:to-blue-500"
                        >
                          <FaEdit />
                          <span>Réaffecter</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {showReassignModal && reassignEquipment && (
              <div className="fixed inset-0 z-[999] flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={() => setShowReassignModal(false)}
                />
                <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
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
                      {emplacement.postes
                        .filter((p) => p.id !== reassignEquipment.posteId)
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
                    className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
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
