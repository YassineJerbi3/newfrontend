"use client";

import React, { useState, useEffect, useRef } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { motion, AnimatePresence } from "framer-motion";

interface Equipement {
  id: string;
  designation: string;
  equipmentType: string;
  numeroSerie: string;
}
interface Stats {
  total: number;
  fonctionnel: number;
  enPanne: number;
  monthly: { month: string; count: number }[];
}

interface MineResponse {
  emplacement?: { id: string; nom: string };
  equipements: Equipement[];
  message?: string;
}

const imageMap: Record<string, string> = {
  IMPRIMANTE: "/images/devices/printer.png",
  PHOTOCOPIEUSE: "/images/devices/photo.png",
  ECRAN: "/images/devices/ecran.png",
  "ECRAN INTERACTIF": "/images/devices/ecraninteractif.png",
  "UNITE CENTRALE": "/images/devices/unite-centrale.png",
  SERVEUR: "/images/devices/serveur.png",
  "CAMERA DE SURVEILLANCE": "/images/devices/camer.png",
  TV: "/images/devices/tv.png",
};
const DEFAULT_IMG = "/images/devices/default.png";

export default function VotreBureauPage() {
  const [data, setData] = useState<MineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [selected, setSelected] = useState<Equipement | null>(null);
  const [showIncidentForm, setShowIncidentForm] = useState(false);

  // Form incident state
  const [priorite, setPriorite] = useState<"URGENT" | "NORMALE" | "BASSE">(
    "NORMALE",
  );
  const [etatEquipement, setEtatEquipement] = useState<"EN_MARCHE" | "ARRET">(
    "EN_MARCHE",
  );
  const [description, setDescription] = useState("");
  const [echeance, setEcheance] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [echeanceError, setEcheanceError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Stats
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Fetch user's equipment
  const fetchMine = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:2000/equipements/mine", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const json: MineResponse = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats for current user
  const fetchStats = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await fetch("http://localhost:2000/equipements/stats/mine", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const json = (await res.json()) as {
        total: number;
        fonctionnel: number;
        enPanne: number;
        monthly: { month: string; count: number }[];
      };
      setStats({
        total: json.total,
        fonctionnel: json.fonctionnel,
        enPanne: json.enPanne,
        monthly: json.monthly,
      });
    } catch (err: any) {
      setStatsError(err.message);
    } finally {
      setStatsLoading(false);
    }
  };

  // On mount, fetch both equipment and stats
  useEffect(() => {
    fetchMine();
    fetchStats();
  }, []);

  // Open detail modal
  const openDetails = (eq: Equipement) => {
    setSelected(eq);
    setShowIncidentForm(false);
    setSubmitError("");
  };

  // Close all modals
  const closeAll = () => {
    setSelected(null);
    setShowIncidentForm(false);
  };

  // Switch to incident form
  const openForm = () => {
    setShowIncidentForm(true);
    setPriorite("NORMALE");
    setEtatEquipement("EN_MARCHE");
    setDescription("");
    setEcheance("");
    setFiles([]);
    setEcheanceError("");
    setSubmitError("");
  };

  // Submit incident
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setEcheanceError("");

    // 1) Validate date (compare only by day)
    if (!echeance) {
      setEcheanceError("Ce champ est obligatoire.");
      return;
    }
    const echeanceDate = new Date(echeance);
    echeanceDate.setHours(0, 0, 0, 0);

    const minDays = priorite === "URGENT" ? 3 : priorite === "NORMALE" ? 5 : 8;
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + minDays);
    minDate.setHours(0, 0, 0, 0);

    if (echeanceDate < minDate) {
      setEcheanceError(
        `La date d’échéance doit être au minimum ${minDays} jour(s) après aujourd’hui.`,
      );
      return;
    }

    // 2) Build FormData
    const payload = new FormData();
    payload.append("equipementId", selected!.id);
    payload.append("priorite", priorite);
    payload.append("description", description);
    payload.append("typeObject", selected!.equipmentType);
    payload.append("etatEquipement", etatEquipement);
    payload.append("echeance", echeance);
    files.forEach((f) => payload.append("pieceJointe", f));

    // 3) Send and handle backend errors
    try {
      const res = await fetch("http://localhost:2000/incidents", {
        method: "POST",
        credentials: "include",
        body: payload,
      });
      const body = await res.json();
      if (!res.ok) {
        // show backend message (e.g. equipment already in panne)
        setSubmitError(body.message || `Erreur ${res.status}`);
        return;
      }
      // success
      closeAll();
      fetchMine();
    } catch (err: any) {
      setSubmitError("Erreur réseau, réessayez plus tard");
    }
  };

  return (
    <DefaultLayout>
      {/* Header */}
      <div className="rounded-b-3xl bg-gradient-to-r from-blue-600 to-blue-400 p-6 text-white">
        <h1 className="text-4xl font-bold">
          Votre Bureau{data?.emplacement && ` : ${data.emplacement.nom}`}
        </h1>
      </div>
      {/* Stats */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        {statsLoading ? (
          <div>Chargement des statistiques…</div>
        ) : statsError ? (
          <div className="text-red-600">Erreur: {statsError}</div>
        ) : stats ? (
          <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div>Total équipements</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.fonctionnel}</div>
              <div>Fonctionnels</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.enPanne}</div>
              <div>En panne</div>
            </div>
            {/* Optionally render a small monthly chart or list */}
            <div className="mt-4 sm:col-span-3">
              <h4 className="mb-2 font-medium">Pannes par mois</h4>
              <ul className="flex space-x-4 overflow-auto">
                {stats.monthly.map((m) => (
                  <li key={m.month} className="text-sm">
                    <span className="font-semibold">{m.month}</span>: {m.count}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      {/* Equipment grid */}
      <div className="p-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">
            Erreur : {error}{" "}
            <button
              onClick={fetchMine}
              className="ml-2 text-blue-600 underline"
            >
              Réessayer
            </button>
          </div>
        ) : data?.message ? (
          <div className="p-6 text-center text-gray-700">{data.message}</div>
        ) : (
          <div className="grid grid-cols-2 gap-12 sm:grid-cols-3 lg:grid-cols-4">
            {data.equipements.map((eq) => (
              <button
                key={eq.id}
                onClick={() => openDetails(eq)}
                className="group focus:outline-none"
                title={eq.designation}
              >
                <img
                  src={imageMap[eq.equipmentType] || DEFAULT_IMG}
                  alt={eq.equipmentType}
                  className="h-32 w-32 object-contain transition-transform hover:scale-110"
                />
                <span className="mt-2 block text-center text-sm opacity-0 transition-opacity group-hover:opacity-100">
                  {eq.equipmentType}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && !showIncidentForm && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-80 rounded-2xl bg-white p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="mb-4 text-2xl font-semibold">
                {selected.designation}
              </h3>
              <p className="mb-2 text-sm text-gray-600">
                N° de série : {selected.numeroSerie}
              </p>
              <button
                onClick={openForm}
                className="mb-2 w-full rounded-lg bg-red-600 py-2 text-white transition hover:bg-red-700"
              >
                Déclarer une intervention
              </button>
              <button
                onClick={closeAll}
                className="w-full rounded-lg bg-gray-200 py-2 text-gray-800 transition hover:bg-gray-300"
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incident Form Modal */}
      <AnimatePresence>
        {showIncidentForm && selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black bg-opacity-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="mb-4 text-2xl font-semibold">
                Déclarer une intervention pour{" "}
                <span className="font-medium">{selected.designation}</span>
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block font-medium">Priorité</label>
                  <select
                    value={priorite}
                    onChange={(e) => setPriorite(e.target.value as any)}
                    required
                    className="w-full rounded border px-3 py-2"
                  >
                    <option value="URGENT">Urgent</option>
                    <option value="NORMALE">Normale</option>
                    <option value="BASSE">Basse</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-medium">
                    État de l’équipement
                  </label>
                  <select
                    value={etatEquipement}
                    onChange={(e) => setEtatEquipement(e.target.value as any)}
                    required
                    className="w-full rounded border px-3 py-2"
                  >
                    <option value="EN_MARCHE">En marche</option>
                    <option value="ARRET">En arrêt</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-medium">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                    className="w-full rounded border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium">
                    Pièces jointes (optionnel)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium">Échéance</label>
                  <input
                    type="date"
                    value={echeance}
                    onChange={(e) => setEcheance(e.target.value)}
                    required
                    className={`w-full rounded border px-3 py-2 ${
                      echeanceError ? "border-red-500" : ""
                    }`}
                  />
                  {echeanceError && (
                    <p className="mt-1 text-sm text-red-600">{echeanceError}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeAll}
                    className="rounded border px-4 py-2 hover:bg-gray-100"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                  >
                    Envoyer
                  </button>
                </div>

                {submitError && (
                  <p className="mt-2 text-sm text-red-600">{submitError}</p>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DefaultLayout>
  );
}
