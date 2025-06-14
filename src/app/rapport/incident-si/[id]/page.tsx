// src/app/rapport/incident-si/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {
  FiUser,
  FiClipboard,
  FiCalendar,
  FiClock,
  FiX,
  FiCheck,
} from "react-icons/fi";

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

interface LigneBonSortie {
  id: string;
  quantiteSortie: number;
  articleMagasin: { designation: string };
}

interface BonSortieExisting {
  id: string;
  dateSortie: string;
  lignes: LigneBonSortie[];
}

interface RapportExisting {
  id: string;
  incidentId: string;
  diagnosticPanne?: string;
  natureIntervention: "INTERNE" | "SOUS_TRAITANT";
  natureResolution: "IMMEDIATE" | "A_PLANIFIER";
  nomExterne?: string;
  prenomExterne?: string;
  emailExterne?: string;
  telephoneExterne?: string;
  travailEffectue?: string;
  dateDebut?: string;
  dateFin?: string;
  cout?: number;
  bonSorties?: BonSortieExisting[];
  statut:
    | "SOUMIS"
    | "A_PLANIFIER"
    | "INVALIDE"
    | "VALIDE"
    | "A_CORRIGER"
    | "NON_PLANIFIE"
    | "MOD_PLANIFIER";
  remarqueResponsable?: string;
}

export default function RapportPage() {
  // Ici, `id` correspond désormais au rapportId
  const { id: rapportId } = useParams() as { id: string };
  const router = useRouter();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [rapport, setRapport] = useState<RapportExisting | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState<string | null>(null);

  // Pour l’invalidation : afficher le champ “remarqueResponsable”
  const [showInvalidateField, setShowInvalidateField] = useState(false);
  const [remarque, setRemarque] = useState("");

  useEffect(() => {
    if (!rapportId) return;

    setLoading(true);
    setErrorLoading(null);

    // 1) On récupère d’abord le rapport via l’API `/rapports/:rapportId`
    const fetchRapport = fetch(`http://localhost:2000/rapports/${rapportId}`, {
      credentials: "include",
    }).then(async (res) => {
      if (res.status === 404) throw new Error("Rapport introuvable");
      return res.json();
    });

    Promise.all([fetchRapport])
      .then(async ([rapportData]: [RapportExisting]) => {
        setRapport(rapportData);

        // 2) Une fois le rapport obtenu, on récupère l’incident via l’`incidentId`
        const incidentId = rapportData.incidentId;
        const res2 = await fetch(
          `http://localhost:2000/incidents/${incidentId}`,
          {
            credentials: "include",
          },
        );
        if (res2.status === 404) {
          throw new Error("Incident lié au rapport introuvable");
        }
        const incidentData: Incident = await res2.json();
        setIncident(incidentData);
      })
      .catch((err: any) => {
        console.error(err);
        setErrorLoading(err.message);
      })
      .finally(() => setLoading(false));
  }, [rapportId]);

  const handleValidate = async () => {
    if (!rapport) return;
    try {
      const res = await fetch(
        `http://localhost:2000/rapports/${rapport.id}/validate`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (!res.ok) {
        console.error("Erreur à la validation :", await res.text());
        return;
      }
      // Après validation, on recharge la page pour mettre à jour le statut
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleInvalidate = async () => {
    if (!rapport) return;
    if (!remarque.trim()) return;
    try {
      const res = await fetch(
        `http://localhost:2000/rapports/${rapport.id}/invalider`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ remarqueResponsable: remarque }),
        },
      );
      if (!res.ok) {
        console.error("Erreur à l’invalidation :", await res.text());
        return;
      }
      // Après invalidation, on recharge
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlanifier = () => {
    if (rapport) {
      router.push(`/planification`);
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center p-10 text-gray-500">
          Chargement…
        </div>
      </DefaultLayout>
    );
  }

  if (errorLoading) {
    return (
      <DefaultLayout>
        <div className="p-10 text-center text-red-600">
          Erreur : {errorLoading}
        </div>
      </DefaultLayout>
    );
  }

  if (!incident || !rapport) {
    return (
      <DefaultLayout>
        <div className="p-10 text-center text-red-600">
          Impossible de trouver l’incident ou le rapport.
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-4xl space-y-8 p-8">
        {/* ─── Fiche d’intervention (Incident) ────────────────────────────── */}
        <section className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-800">
            <FiUser className="text-blue-600" />
            Fiche d’intervention
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Créateur */}
            <div>
              <div className="text-sm font-medium text-gray-600">Nom</div>
              <input
                readOnly
                value={incident.createur.nom}
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
              />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Prénom</div>
              <input
                readOnly
                value={incident.createur.prenom}
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
              />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Rôle</div>
              <input
                readOnly
                value={incident.createur.roles}
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
              />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Direction</div>
              <input
                readOnly
                value={incident.createur.direction}
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
              />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Fonction</div>
              <input
                readOnly
                value={incident.createur.fonction}
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
              />
            </div>

            {/* Priorité */}
            <div>
              <div className="text-sm font-medium text-gray-600">Priorité</div>
              <input
                readOnly
                value={incident.priorite}
                className="w-32 rounded-md border bg-gray-100 px-3 py-2 text-center text-gray-700"
              />
            </div>

            {/* Équipement */}
            <div>
              <div className="text-sm font-medium text-gray-600">
                Famille MI
              </div>
              <input
                readOnly
                value={incident.equipement.familleMI}
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
              />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Type</div>
              <input
                readOnly
                value={incident.equipement.equipmentType}
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
              />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">
                N° de série
              </div>
              <input
                readOnly
                value={incident.equipement.numeroSerie}
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
              />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">
                Emplacement
              </div>
              <input
                readOnly
                value={incident.equipement.emplacement.nom}
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
              />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">État</div>
              <input
                readOnly
                value={incident.equipement.etat}
                className="w-32 rounded-md border bg-gray-100 px-3 py-2 text-center text-gray-700"
              />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Échéance</div>
              <input
                readOnly
                type="date"
                value={new Date(incident.echeance).toISOString().slice(0, 10)}
                className="w-48 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
              />
            </div>
            <div className="sm:col-span-2">
              <div className="text-sm font-medium text-gray-600">
                Description
              </div>
              <textarea
                readOnly
                defaultValue={incident.description}
                rows={3}
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
              />
            </div>
            <div className="sm:col-span-2">
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
        </section>

        {/* ─── Rapport (s’il existe) ─────────────────────────────────────────── */}
        <section className="space-y-6 rounded-lg bg-white p-6 shadow">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            <FiClipboard className="text-green-600" />
            Rapport d’intervention
          </h2>

          {!rapport ? (
            <p className="text-gray-600">Aucun rapport trouvé.</p>
          ) : (
            <>
              {/* Diagnostic de la panne */}
              <div>
                <div className="text-sm font-medium text-gray-600">
                  Diagnostic
                </div>
                <textarea
                  readOnly
                  defaultValue={rapport.diagnosticPanne || ""}
                  rows={3}
                  className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Nature de l’intervention */}
                <div>
                  <div className="text-sm font-medium text-gray-600">
                    Nature de l’intervention
                  </div>
                  <input
                    readOnly
                    value={
                      rapport.natureIntervention === "INTERNE"
                        ? "Interne"
                        : "Sous-traitant"
                    }
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
                  />
                </div>
                {/* Infos externes si SOUS-TRAITANT */}
                {rapport.natureIntervention === "SOUS_TRAITANT" && (
                  <div className="space-y-2 sm:col-span-2">
                    <div className="text-sm italic text-gray-500">
                      Infos externes :
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <input
                        readOnly
                        value={rapport.prenomExterne || ""}
                        placeholder="Prénom externe"
                        className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
                      />
                      <input
                        readOnly
                        value={rapport.nomExterne || ""}
                        placeholder="Nom externe"
                        className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
                      />
                      <input
                        readOnly
                        value={rapport.emailExterne || ""}
                        placeholder="Email externe"
                        className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
                      />
                      <input
                        readOnly
                        value={rapport.telephoneExterne || ""}
                        placeholder="Téléphone externe"
                        className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Nature de la résolution */}
                <div>
                  <div className="text-sm font-medium text-gray-600">
                    Nature de la résolution
                  </div>
                  <input
                    readOnly
                    value={
                      rapport.natureResolution === "IMMEDIATE"
                        ? "Immédiate"
                        : "À planifier"
                    }
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
                  />
                </div>
                {/* Dates début / fin */}
                <div>
                  <div className="text-sm font-medium text-gray-600">
                    Date début
                  </div>
                  <input
                    readOnly
                    type="datetime-local"
                    value={rapport.dateDebut?.slice(0, 16) || ""}
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
                  />
                </div>
                {rapport.dateFin && (
                  <div>
                    <div className="text-sm font-medium text-gray-600">
                      Date fin
                    </div>
                    <input
                      readOnly
                      type="datetime-local"
                      value={rapport.dateFin.slice(0, 16)}
                      className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
                    />
                  </div>
                )}
              </div>

              {/* Coût */}
              <div>
                <div className="text-sm font-medium text-gray-600">
                  Coût (DT)
                </div>
                <input
                  readOnly
                  value={rapport.cout != null ? String(rapport.cout) : ""}
                  className="w-32 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
                />
              </div>

              {/* Travail effectué */}
              <div>
                <div className="text-sm font-medium text-gray-600">
                  Travail effectué
                </div>
                <textarea
                  readOnly
                  defaultValue={rapport.travailEffectue || ""}
                  rows={3}
                  className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
                />
              </div>

              {/* Bons de sortie existants */}
              {rapport.bonSorties && rapport.bonSorties.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-600">
                    Bons de sortie
                  </div>
                  <ul className="space-y-4 text-gray-700">
                    {rapport.bonSorties.map((bon) => (
                      <li key={bon.id} className="space-y-1">
                        <div className="text-sm text-gray-600">
                          Sortie du{" "}
                          {new Date(bon.dateSortie).toLocaleDateString("fr-FR")}
                        </div>
                        <ul className="list-inside list-disc pl-4">
                          {bon.lignes.map((l) => (
                            <li key={l.id}>
                              {l.articleMagasin.designation} – Qté :{" "}
                              {l.quantiteSortie}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Statut actuel */}
              <div>
                <div className="text-sm font-medium text-gray-600">Statut</div>
                <input
                  readOnly
                  value={rapport.statut}
                  className="w-32 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-center text-gray-700"
                />
              </div>

              {/* Remarque du Responsable (s’il y en a déjà) */}
              {rapport.remarqueResponsable && (
                <div>
                  <div className="text-sm font-medium text-gray-600">
                    Remarque
                  </div>
                  <textarea
                    readOnly
                    defaultValue={rapport.remarqueResponsable}
                    rows={2}
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
                  />
                </div>
              )}

              {/* ─── Actions selon statut et natureResolution ───────────────────── */}
              <section className="mt-6">
                {rapport.statut === "SOUMIS" &&
                rapport.natureResolution === "A_PLANIFIER" ? (
                  <button
                    onClick={handlePlanifier}
                    className="flex items-center gap-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    <FiCalendar /> Planifier
                  </button>
                ) : (
                  (rapport.statut === "A_CORRIGER" ||
                    (rapport.statut === "SOUMIS" &&
                      rapport.natureResolution === "IMMEDIATE")) && (
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <button
                          onClick={handleValidate}
                          className="flex items-center gap-1 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        >
                          <FiCheck /> Valider
                        </button>
                        <button
                          onClick={() => setShowInvalidateField(true)}
                          className="flex items-center gap-1 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                        >
                          <FiX /> Invalider
                        </button>
                      </div>

                      {showInvalidateField && (
                        <div className="space-y-2">
                          <textarea
                            value={remarque}
                            onChange={(e) => setRemarque(e.target.value)}
                            placeholder="Remarque pour le technicien…"
                            rows={3}
                            className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-700"
                          />
                          <button
                            onClick={handleInvalidate}
                            disabled={!remarque.trim()}
                            className={`flex items-center gap-1 rounded px-4 py-2 text-white ${
                              !remarque.trim()
                                ? "cursor-not-allowed bg-gray-400"
                                : "bg-red-600 hover:bg-red-700"
                            }`}
                          >
                            <FiX /> Confirmer Invalidation
                          </button>
                        </div>
                      )}
                    </div>
                  )
                )}
              </section>
            </>
          )}
        </section>
      </div>
    </DefaultLayout>
  );
}
