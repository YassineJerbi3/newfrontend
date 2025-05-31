// src/app/rapport/incident/[id]/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { FiUser, FiClipboard, FiCalendar, FiClock } from "react-icons/fi";
import { motion } from "framer-motion";

// Types TS pour l’incident
interface Incident {
  id: string;
  createur: {
    nom: string;
    prenom: string;
    fonction: string;
    roles: string;
    direction: string;
  };
  priorite: "URGENT" | "NORMALE" | "BASSE";
  equipement: {
    familleMI: string;
    equipmentType: string;
    numeroSerie: string;
    emplacement: { nom: string };
    etat: string;
  };
  description: string;
  pieceJointePaths: string[];
  dateCreation: string;
  echeance: string;
}

// Utilitaire CSS
const inputBase =
  "w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-2 text-gray-900 " +
  "focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition";

export default function CombinedIncidentForms() {
  const router = useRouter();
  const pathname = usePathname();
  const incidentId = pathname.split("/").pop();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [view, setView] = useState<"fiche" | "rapport">("fiche");
  const [existing, setExisting] = useState<any>(null);

  // Form state
  const [form, setForm] = useState({
    diagnosticPanne: "",
    natureIntervention: "INTERNE" as "INTERNE" | "SOUS_TRAITANT",
    natureResolution: "IMMEDIATE" as "IMMEDIATE" | "A_PLANIFIER",
    nomExterne: "",
    prenomExterne: "",
    emailExterne: "",
    travailEffectue: "",
    dateDebut: "", // YYYY-MM-DD
    dateFin: "", // YYYY-MM-DD
    cout: "",
  });

  const [started, setStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Récupération de l’incident
  useEffect(() => {
    if (!incidentId) return;
    fetch(`http://localhost:2000/incidents/${incidentId}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(setIncident)
      .catch(console.error);
  }, [incidentId]);

  // Récupération du rapport existant
  useEffect(() => {
    if (!incidentId) return;
    fetch(`http://localhost:2000/rapports/${incidentId}`, {
      credentials: "include",
    })
      .then((r) => (r.status === 404 ? null : r.json()))
      .then((data) => {
        if (data) {
          setExisting(data);
          setForm({
            diagnosticPanne: data.diagnosticPanne || "",
            natureIntervention: data.natureIntervention,
            natureResolution: data.natureResolution,
            nomExterne: data.nomExterne || "",
            prenomExterne: data.prenomExterne || "",
            emailExterne: data.emailExterne || "",
            travailEffectue: data.travailEffectue || "",
            dateDebut: data.dateDebut?.slice(0, 10) || "",
            dateFin: data.dateFin?.slice(0, 10) || "",
            cout: data.cout != null ? String(data.cout) : "",
          });
        }
      })
      .catch(console.error);
  }, [incidentId]);

  // Helpers pour la fiche
  const dateInter = useMemo(
    () =>
      incident
        ? new Date(incident.dateCreation).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "",
    [incident],
  );
  const timeInter = useMemo(
    () =>
      incident
        ? new Date(incident.dateCreation).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
    [incident],
  );

  if (!incident) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center p-10">
          <div className="animate-pulse text-gray-400">Chargement…</div>
        </div>
      </DefaultLayout>
    );
  }

  // Initialise dateDebut à la première interaction
  const markStarted = () => {
    if (!started) {
      const today = new Date().toISOString().slice(0, 10);
      setForm((f) => ({ ...f, dateDebut: today }));
      setStarted(true);
    }
  };

  // Handle change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (
      name !== "dateDebut" &&
      name !== "dateFin" &&
      name !== "cout" &&
      name !== "natureIntervention" &&
      name !== "natureResolution"
    ) {
      markStarted();
    }
    setForm((f) => ({ ...f, [name]: value }));
    if (name === "natureIntervention" && value === "SOUS_TRAITANT") {
      setForm((f) => ({ ...f, natureResolution: "A_PLANIFIER" }));
    }
  };

  // Calcul durée en heures (minimum 24h si dates identiques ou dateFin < dateDebut)
  const computeDurationHours = (start: string, end: string) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    let diffMs = d2.getTime() - d1.getTime();
    if (diffMs <= 0) diffMs = 24 * 3600_000;
    const hours = diffMs / 3600_000;
    return hours.toFixed(2);
  };

  // Soumission après confirmation
  const doSubmit = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const duree = computeDurationHours(form.dateDebut, today);
    const payload: any = {
      incidentId,
      diagnosticPanne: form.diagnosticPanne || undefined,
      natureIntervention: form.natureIntervention,
      natureResolution: form.natureResolution,
      travailEffectue: form.travailEffectue || undefined,
      dateDebut: form.dateDebut,
      dateFin: today,
      duree,
      cout: form.cout ? Number(form.cout) : undefined,
      ...(form.natureIntervention === "SOUS_TRAITANT" && {
        nomExterne: form.nomExterne,
        prenomExterne: form.prenomExterne,
        emailExterne: form.emailExterne,
      }),
    };
    const url = existing
      ? `http://localhost:2000/rapports/${existing.id}`
      : `http://localhost:2000/rapports`;
    const res = await fetch(url, {
      method: existing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setShowModal(false);
      router.refresh();
      setView("fiche");
    } else {
      console.error("Erreur lors de la soumission", await res.text());
    }
  };

  return (
    <DefaultLayout>
      {/* En-tête & onglets */}
      <div className="flex flex-col items-start justify-between p-8 md:flex-row md:items-center">
        <h1 className="mb-4 text-3xl font-bold md:mb-0">Rapport d'incident</h1>
        <div className="space-x-2">
          <button
            onClick={() => setView("fiche")}
            className={`rounded-lg border px-4 py-2 ${
              view === "fiche"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Fiche
          </button>
          <button
            onClick={() => setView("rapport")}
            className={`rounded-lg border px-4 py-2 ${
              view === "rapport"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Rapport
          </button>
        </div>
      </div>

      <div className="space-y-6 p-8">
        {view === "fiche" ? (
          // ─── FICHE ───
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              className="rounded-lg bg-white p-6 shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-4 flex items-center text-lg font-semibold">
                <FiUser className="mr-2 text-indigo-600" /> Identification
              </div>
              <div className="space-y-4">
                {[
                  { label: "Nom", value: incident.createur.nom },
                  { label: "Prénom", value: incident.createur.prenom },
                  { label: "Rôle", value: incident.createur.roles },
                  { label: "Direction", value: incident.createur.direction },
                  { label: "Fonction", value: incident.createur.fonction },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-sm font-medium text-gray-600">
                      {label}
                    </div>
                    <input readOnly value={value} className={inputBase} />
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="rounded-lg bg-white p-6 shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-4 flex items-center text-lg font-semibold">
                <FiClipboard className="mr-2 text-indigo-600" /> Détails
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FiCalendar className="text-indigo-600" />
                  <div>Date : {dateInter}</div>
                  <FiClock className="ml-4 text-indigo-600" />
                  <div>Heure : {timeInter}</div>
                </div>
                <div className="space-y-2">
                  {[
                    {
                      label: "Famille MI",
                      value: incident.equipement.familleMI,
                    },
                    {
                      label: "Type",
                      value: incident.equipement.equipmentType,
                    },
                    {
                      label: "N° de série",
                      value: incident.equipement.numeroSerie,
                    },
                    {
                      label: "Emplacement",
                      value: incident.equipement.emplacement.nom,
                    },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-sm font-medium text-gray-600">
                        {label}
                      </div>
                      <input readOnly value={value} className={inputBase} />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">État</div>
                  <input
                    readOnly
                    value={incident.equipement.etat}
                    className="w-32 rounded border bg-gray-50 px-2 py-1 text-center"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">
                    Description
                  </div>
                  <textarea
                    readOnly
                    defaultValue={incident.description}
                    rows={3}
                    className={inputBase}
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">
                    Échéance
                  </div>
                  <input
                    readOnly
                    type="date"
                    value={new Date(incident.echeance)
                      .toISOString()
                      .slice(0, 10)}
                    className={inputBase + " w-48"}
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">
                    Pièces jointes
                  </div>
                  <ul className="list-inside list-disc text-blue-600">
                    {incident.pieceJointePaths.length ? (
                      incident.pieceJointePaths.map((p) => (
                        <li key={p}>
                          <a
                            href={`http://localhost:2000/uploads/incidents/${p}`}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            {p.split("/").pop()}
                          </a>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">Aucune pièce jointe</li>
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          // ── FORMULAIRE RAPPORT ──
          <motion.div
            className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="mb-4 text-2xl font-semibold">
              Rapport d’intervention
            </h2>

            {/* Diagnostic de la panne */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Diagnostic de la panne
              </label>
              <textarea
                name="diagnosticPanne"
                rows={5}
                value={form.diagnosticPanne}
                onChange={handleChange}
                className={`${inputBase} min-h-[120px]`}
                placeholder="Décris ici le diagnostic…"
              />
            </div>

            {/* Nature de l’intervention */}
            <div className="mb-6">
              <div className="mb-2 block text-sm font-medium text-gray-700">
                Nature de l’intervention
              </div>
              <div className="flex items-center gap-6">
                {(["INTERNE", "SOUS_TRAITANT"] as const).map((opt) => (
                  <label key={opt} className="flex items-center">
                    <input
                      type="radio"
                      name="natureIntervention"
                      value={opt}
                      checked={form.natureIntervention === opt}
                      onChange={handleChange}
                    />
                    <span className="ml-2">
                      {opt === "INTERNE" ? "Interne" : "Sous-traitant"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Infos externes */}
            {form.natureIntervention === "SOUS_TRAITANT" && (
              <div className="mb-6 space-y-4">
                {[
                  { name: "prenomExterne", label: "Prénom externe" },
                  { name: "nomExterne", label: "Nom externe" },
                  {
                    name: "emailExterne",
                    label: "Email externe",
                    type: "email",
                  },
                ].map(({ name, label, type }) => (
                  <div key={name}>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {label}
                    </label>
                    <input
                      type={(type as string) || "text"}
                      name={name}
                      value={(form as any)[name]}
                      onChange={handleChange}
                      className={inputBase}
                      placeholder={label}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Nature de la résolution */}
            <div className="mb-6">
              <div className="mb-2 block text-sm font-medium text-gray-700">
                Nature de la résolution
              </div>
              <div className="flex items-center gap-6">
                {(["IMMEDIATE", "A_PLANIFIER"] as const).map((opt) => (
                  <label key={opt} className="flex items-center">
                    <input
                      type="radio"
                      name="natureResolution"
                      value={opt}
                      checked={form.natureResolution === opt}
                      onChange={handleChange}
                      disabled={
                        form.natureIntervention === "SOUS_TRAITANT" &&
                        opt === "IMMEDIATE"
                      }
                    />
                    <span className="ml-2">
                      {opt === "IMMEDIATE" ? "Immédiate" : "À planifier"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Date début
                </label>
                <input
                  type="date"
                  name="dateDebut"
                  value={form.dateDebut}
                  readOnly
                  className={inputBase}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Date fin
                </label>
                <input
                  type="date"
                  name="dateFin"
                  value={new Date().toISOString().slice(0, 10)}
                  readOnly
                  className={inputBase}
                />
              </div>
            </div>

            {/* Coût */}
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Coût (€)
              </label>
              <input
                type="number"
                name="cout"
                step="0.01"
                value={form.cout}
                onChange={handleChange}
                className={inputBase}
              />
            </div>

            {/* Travail effectué */}
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Travail effectué
              </label>
              <textarea
                name="travailEffectue"
                rows={5}
                value={form.travailEffectue}
                onChange={handleChange}
                className={`${inputBase} min-h-[120px]`}
                placeholder="Décris ici le travail effectué…"
              />
            </div>

            {/* Bouton Envoyer */}
            <div className="text-right">
              <button
                onClick={() => {
                  const today = new Date().toISOString().slice(0, 10);
                  const dur = computeDurationHours(form.dateDebut, today);
                  setForm((f) => ({
                    ...f,
                    dateFin: today,
                    duree: dur,
                  }));
                  setShowModal(true);
                }}
                className="rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-500"
              >
                Envoyer
              </button>
            </div>

            {/* Modal confirmation */}
            {showModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/40">
                <div className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6">
                  <h3 className="text-lg font-semibold">Confirmer l’envoi ?</h3>
                  <p>Voulez-vous vraiment envoyer ce rapport ?</p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setShowModal(false)}
                      className="rounded border px-4 py-2"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={doSubmit}
                      className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    >
                      Confirmer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </DefaultLayout>
  );
}

// Note: Assure-toi que `computeDurationHours` et `doSubmit` sont déclarés
// _au-dessus_ du return, dans le même scope de la fonction.
