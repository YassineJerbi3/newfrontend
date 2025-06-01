// src/app/rapport/incident/[id]/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {
  FiUser,
  FiClipboard,
  FiCalendar,
  FiClock,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { motion } from "framer-motion";

// ─── Types TS ────────────────────────────────────────────────────────────────

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

interface TypeConsommable {
  id: string;
  name: string;
}

interface ArticleMagasin {
  id: string;
  designation: string;
  quantite: number;
  typeConsommable: TypeConsommable;
}

interface BonSortieExisting {
  id: string;
  articleMagasin: ArticleMagasin;
  quantiteSortie: number;
}

interface RapportExisting {
  id: string;
  diagnosticPanne?: string;
  natureIntervention: "INTERNE" | "SOUS_TRAITANT";
  natureResolution: "IMMEDIATE" | "A_PLANIFIER";
  nomExterne?: string;
  prenomExterne?: string;
  emailExterne?: string;
  travailEffectue?: string;
  dateDebut?: string;
  dateFin?: string;
  cout?: number;
  bonSorties?: BonSortieExisting[];
}

// ─── CSS Utilitaire ───────────────────────────────────────────────────────────

const inputBase =
  "w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-2 text-gray-900 " +
  "focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition";

// ─── Composant Principal ─────────────────────────────────────────────────────

export default function CombinedIncidentForms() {
  const router = useRouter();
  const pathname = usePathname();
  const incidentId = pathname.split("/").pop();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [view, setView] = useState<"fiche" | "rapport">("fiche");
  const [existing, setExisting] = useState<RapportExisting | null>(null);

  // Le formulaire du rapport
  const [form, setForm] = useState({
    diagnosticPanne: "",
    natureIntervention: "INTERNE" as "INTERNE" | "SOUS_TRAITANT",
    natureResolution: "IMMEDIATE" as "IMMEDIATE" | "A_PLANIFIER",
    nomExterne: "",
    prenomExterne: "",
    emailExterne: "",
    travailEffectue: "",
    dateDebut: "",
    dateFin: "",
    cout: "",
  });

  // Les bon de sortie sélectionnés (lignes dynamiques)
  const [selectedConsumables, setSelectedConsumables] = useState<
    { articleMagasinId: string; quantiteSortie: number }[]
  >([]);

  // Liste des types & articles
  const [types, setTypes] = useState<TypeConsommable[]>([]);
  const [articles, setArticles] = useState<ArticleMagasin[]>([]);
  const [filterTypeId, setFilterTypeId] = useState<string>("");

  // Modal de confirmation
  const [showModal, setShowModal] = useState(false);

  // ─── Charger l’incident ───────────────────────────────────────────────────

  useEffect(() => {
    if (!incidentId) return;
    fetch(`http://localhost:2000/incidents/${incidentId}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(setIncident)
      .catch(console.error);
  }, [incidentId]);

  // ─── Charger le rapport existant (avec bons de sortie) ─────────────────────

  useEffect(() => {
    if (!incidentId) return;
    fetch(`http://localhost:2000/rapports/${incidentId}`, {
      credentials: "include",
    })
      .then((r) => (r.status === 404 ? null : r.json()))
      .then((data: RapportExisting | null) => {
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
          if (data.bonSorties?.length) {
            setSelectedConsumables(
              data.bonSorties.map((b) => ({
                articleMagasinId: b.articleMagasin.id,
                quantiteSortie: b.quantiteSortie,
              })),
            );
          }
        }
      })
      .catch(console.error);
  }, [incidentId]);

  // ─── Charger types & articles ─────────────────────────────────────────────
  useEffect(() => {
    fetch("http://localhost:2000/types-consommable", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(setTypes)
      .catch(console.error);

    // ← CORRECTION HERE: fetch from /magasin instead of /articles-magasin
    fetch("http://localhost:2000/magasin", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(setArticles)
      .catch(console.error);
  }, []);

  // ─── Format date/heure pour la fiche ────────────────────────────────────────

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

  // ─── Handler générique pour les champs du formulaire ──────────────────────

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    // Si on change natureIntervention en "SOUS_TRAITANT", forcer natureResolution à "A_PLANIFIER"
    setForm((f) => {
      let updated = { ...f, [name]: value };
      if (name === "natureIntervention" && value === "SOUS_TRAITANT") {
        updated.natureResolution = "A_PLANIFIER";
      }
      return updated;
    });
  };

  // ─── Calcul automatique de la durée en heures (2 décimales) ─────────────────

  const computeDurationHours = (start: string, end: string) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    let diffMs = d2.getTime() - d1.getTime();
    if (diffMs < 0) diffMs = 0;
    const hours = diffMs / 3_600_000;
    return hours.toFixed(2);
  };

  // ─── Gestion des lignes “Bon de sortie” ────────────────────────────────────

  const addConsumableLine = () => {
    setSelectedConsumables((prev) => [
      ...prev,
      { articleMagasinId: "", quantiteSortie: 1 },
    ]);
  };
  const removeConsumableLine = (i: number) => {
    setSelectedConsumables((prev) => prev.filter((_, idx) => idx !== i));
  };
  const updateConsumableLine = (
    index: number,
    field: "articleMagasinId" | "quantiteSortie",
    value: string | number,
  ) => {
    setSelectedConsumables((prev) =>
      prev.map((line, idx) =>
        idx !== index
          ? line
          : {
              ...line,
              [field]:
                field === "quantiteSortie" ? Number(value) : (value as string),
            },
      ),
    );
  };

  // ─── Soumission du rapport ─────────────────────────────────────────────────

  /**
   * @param envoyer – si true, on met statut = SOUMIS et on crée BonsSortie
   *                   si false, on reste Brouillon (statut par défaut), pas de notif.
   */
  const submitRapport = async (envoyer: boolean) => {
    if (!incidentId) return;
    // Préparer l’objet payload à envoyer au backend
    const payloadRapport: any = {
      incidentId,
      diagnosticPanne: form.diagnosticPanne || undefined,
      natureIntervention: form.natureIntervention,
      natureResolution: form.natureResolution,
      travailEffectue: form.travailEffectue || undefined,
      dateDebut: form.dateDebut || undefined,
      dateFin: form.dateFin || undefined,
      cout: form.cout ? Number(form.cout) : undefined,
      nomExterne:
        form.natureIntervention === "SOUS_TRAITANT"
          ? form.nomExterne
          : undefined,
      prenomExterne:
        form.natureIntervention === "SOUS_TRAITANT"
          ? form.prenomExterne
          : undefined,
      emailExterne:
        form.natureIntervention === "SOUS_TRAITANT"
          ? form.emailExterne
          : undefined,
      ...(envoyer && { statut: "SOUMIS" }), // si on envoie, on passe statut = SOUMIS
    };

    let rapportSaved: RapportExisting;

    if (existing) {
      // PATCH si on modifie un rapport déjà existant
      const res = await fetch(`http://localhost:2000/rapports/${existing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payloadRapport),
      });
      if (!res.ok) {
        console.error("Erreur PATCH rapport", await res.text());
        return;
      }
      rapportSaved = await res.json();
    } else {
      // POST si on crée un nouveau rapport
      const res = await fetch(`http://localhost:2000/rapports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payloadRapport),
      });
      if (!res.ok) {
        console.error("Erreur POST rapport", await res.text());
        return;
      }
      rapportSaved = await res.json();
    }

    // Si on “envoie” (statut = SOUMIS), créer autant de bons de sortie que de lignes comparables
    if (envoyer && selectedConsumables.length) {
      for (const line of selectedConsumables) {
        if (line.articleMagasinId && line.quantiteSortie > 0) {
          const dto = {
            rapportId: rapportSaved.id,
            articleMagasinId: line.articleMagasinId,
            quantiteSortie: line.quantiteSortie,
          };
          const resBon = await fetch(`http://localhost:2000/bons-sortie`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(dto),
          });
          if (!resBon.ok) {
            console.error("Erreur création bon de sortie", await resBon.text());
          }
        }
      }
    }

    // Fermer modal, rafraîchir la page, repasser en vue “fiche”
    setShowModal(false);
    router.refresh();
    setView("fiche");
  };

  if (!incident) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center p-10">
          <div className="animate-pulse text-gray-400">Chargement…</div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      {/* ─── En-tête + Onglets ───────────────────────────────────────────────── */}
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
          // ─── “Fiche” mode ───────────────────────────────────────────────────
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
                {existing && existing.bonSorties?.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-600">
                      Bons de sortie liés
                    </div>
                    <ul className="space-y-1">
                      {existing.bonSorties!.map((b) => (
                        <li key={b.id} className="text-sm text-gray-700">
                          {b.articleMagasin.designation} – Quantité :{" "}
                          {b.quantiteSortie}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        ) : (
          // ─── “Formulaire Rapport” mode ──────────────────────────────────────
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

            {/* Infos externes (si SOUS-TRAITANT) */}
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

            {/* Dates (modifiables) */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Date début
                </label>
                <input
                  type="date"
                  name="dateDebut"
                  value={form.dateDebut}
                  onChange={handleChange}
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
                  value={form.dateFin}
                  onChange={handleChange}
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

            {/* ─── SECTION “Bon de sortie” ──────────────────────────────── */}
            <div className="mb-6 rounded-lg border border-gray-200 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <FiPlus className="text-indigo-600" /> Consommables
                </div>
                <button
                  onClick={addConsumableLine}
                  className="rounded bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-500"
                >
                  Ajouter une ligne
                </button>
              </div>

              {selectedConsumables.map((line, idx) => {
                // Toujours assurer qu’articles est un array
                const allArticles: ArticleMagasin[] = Array.isArray(articles)
                  ? articles
                  : [];

                // Si un filtre est appliqué, ne garder que ceux du type choisi
                const availableArticles = filterTypeId
                  ? allArticles.filter(
                      (a) => a.typeConsommable.id === filterTypeId,
                    )
                  : allArticles;

                // Trouver l’article sélectionné pour cette ligne pour le “maxQty”
                const selectedArticle = allArticles.find(
                  (art) => art.id === line.articleMagasinId,
                );
                const maxQty = selectedArticle ? selectedArticle.quantite : 1;

                return (
                  <div
                    key={idx}
                    className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-4 md:gap-4"
                  >
                    {/* 1) Sélection du type consommable */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Type
                      </label>
                      <select
                        name="typeConsommable"
                        value={filterTypeId}
                        onChange={(e) => setFilterTypeId(e.target.value)}
                        className={`${inputBase} cursor-pointer`}
                      >
                        <option value="">-- Type consommable --</option>
                        {types.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2) Sélection de l’article (designation) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Désignation
                      </label>
                      <select
                        name="articleMagasinId"
                        value={line.articleMagasinId}
                        onChange={(e) =>
                          updateConsumableLine(
                            idx,
                            "articleMagasinId",
                            e.target.value,
                          )
                        }
                        className={`${inputBase} cursor-pointer`}
                      >
                        <option value="">-- Sélectionner article --</option>
                        {availableArticles.map((a) => (
                          <option
                            key={a.id}
                            value={a.id}
                            disabled={a.quantite === 0}
                          >
                            {a.designation} ({a.quantite} dispo)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3) Quantité à sortir */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Quantité
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={maxQty}
                        name="quantiteSortie"
                        value={line.quantiteSortie}
                        onChange={(e) =>
                          updateConsumableLine(
                            idx,
                            "quantiteSortie",
                            Number(e.target.value),
                          )
                        }
                        className={inputBase}
                      />
                    </div>

                    {/* 4) Bouton “Supprimer” */}
                    <div className="flex items-end">
                      <button
                        onClick={() => removeConsumableLine(idx)}
                        className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                );
              })}

              {selectedConsumables.length === 0 && (
                <p className="text-sm text-gray-500">
                  Aucun consommable sélectionné.
                </p>
              )}
            </div>

            {/* ─── Boutons “Sauvegarder (Brouillon)” & “Envoyer (Soumis)” ───────── */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setView("fiche")}
                className="rounded border px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  // “Sauvegarder” : on ne met pas statut = SOUMIS
                  submitRapport(false);
                }}
                className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
              >
                Sauvegarder (Brouillon)
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Envoyer (Soumis)
              </button>
            </div>

            {/* ─── Modal de confirmation d’envoi ────────────────────────────────── */}
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
                      onClick={() => submitRapport(true)}
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
