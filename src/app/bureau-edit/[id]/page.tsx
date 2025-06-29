// src/app/bureaux/[id]/page.tsx
"use client";

import React, { useEffect, useState, FormEvent } from "react";
import { usePathname } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {
  FaDesktop,
  FaList,
  FaTh,
  FaTv,
  FaLayerGroup,
  FaTag,
  FaInfoCircle,
  FaBarcode,
  FaHashtag,
  FaUserTie,
  FaTimes,
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

    fetch(`${API}/postes/${poste.id}/equipements`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data: any[]) => {
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
        setEquipmentList(mapped);
      })
      .catch((err) => alert("Erreur chargement équipements : " + err.message));
  };

  const closeAll = () => {
    setShowEquipmentModal(false);
    setSelectedPoste(null);
    setEquipmentList([]);
    setShowEquipDetailModal(false);
    setSelectedEquipment(null);
  };

  const openEquipDetailModal = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setShowEquipDetailModal(true);
  };
  const closeEquipDetailModal = () => {
    setSelectedEquipment(null);
    setShowEquipDetailModal(false);
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
                  className={`rounded-lg p-2 transition ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title="Vue Grille"
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
                  title="Vue Liste"
                >
                  <FaList size={20} />
                </button>
              </div>
            </div>

            <EmplacementStats emplacementId={emplacement.id} className="mb-8" />

            {/* GRID or LIST */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {emplacement.postes.map((poste) => (
                  <div
                    key={poste.id}
                    onClick={() => openEquipmentModal(poste)}
                    className="flex cursor-pointer flex-col items-center space-y-4 rounded-2xl bg-white p-6 shadow-md transition-transform hover:scale-105"
                  >
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
                            className={`cursor-pointer transition hover:bg-blue-50 ${
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }`}
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

            {/* Equipment Modal */}
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
                        <FaTimes />
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
                                    className="flex flex-col justify-between space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow transition hover:shadow-lg"
                                  >
                                    <div className="flex items-center space-x-4">
                                      <div className="flex-shrink-0">
                                        {type === "ECRAN" ? (
                                          <FaTv
                                            className="text-blue-600"
                                            size={24}
                                          />
                                        ) : (
                                          <FaLayerGroup
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
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Equipment Detail Modal */}
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
                          <FaLayerGroup size={28} />
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
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </DefaultLayout>
  );
}
