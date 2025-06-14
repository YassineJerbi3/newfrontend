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
  FiMail,
  FiPhone,
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
interface LigneBonSortie {
  id: string;
  quantiteSortie: number;
  articleMagasin: ArticleMagasin;
}
interface BonSortieExisting {
  id: string;
  dateSortie: string;
  lignes: LigneBonSortie[];
}

interface RapportExisting {
  id: string;
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
  statut: "BROUILLON" | "SOUMIS" | "A_PLANIFIER" | "INVALIDE" | "VALIDE";
}

// ─── CSS Utilitaire ───────────────────────────────────────────────────────────

const inputBase =
  "w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-gray-900 " +
  "focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition";

const inputDisabled =
  "w-full rounded-md border border-gray-200 bg-gray-100 px-4 py-2 text-gray-500 cursor-not-allowed";

const sectionTitle =
  "mb-2 flex items-center gap-2 text-lg font-semibold text-gray-800";

// ─── Composant Principal ─────────────────────────────────────────────────────

export default function CombinedIncidentForms() {
  const router = useRouter();
  const pathname = usePathname();
  const incidentId = pathname.split("/").pop();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [view, setView] = useState<"fiche" | "rapport">("fiche");
  const [existing, setExisting] = useState<RapportExisting | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Le formulaire du rapport
  const [form, setForm] = useState({
    diagnosticPanne: "",
    natureIntervention: "INTERNE" as "INTERNE" | "SOUS_TRAITANT",
    natureResolution: "IMMEDIATE" as "IMMEDIATE" | "A_PLANIFIER",
    nomExterne: "",
    prenomExterne: "",
    emailExterne: "",
    telephoneExterne: "",
    travailEffectue: "",
    dateDebut: "",
    dateFin: "",
    cout: "",
  });

  // Erreurs de validation
  const [errors, setErrors] = useState<Record<string, string>>({});

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
          // Remplir le formulaire avec les valeurs existantes
          setForm({
            diagnosticPanne: data.diagnosticPanne || "",
            natureIntervention: data.natureIntervention,
            natureResolution: data.natureResolution,
            nomExterne: data.nomExterne || "",
            prenomExterne: data.prenomExterne || "",
            emailExterne: data.emailExterne || "",
            telephoneExterne: data.telephoneExterne || "",
            travailEffectue: data.travailEffectue || "",
            dateDebut: data.dateDebut?.slice(0, 16) || "",
            dateFin: data.dateFin?.slice(0, 16) || "",
            cout: data.cout != null ? String(data.cout) : "",
          });
          if (data.bonSorties?.length) {
            const flatLines = data.bonSorties.flatMap((b) =>
              b.lignes.map((l) => ({
                articleMagasinId: l.articleMagasin.id,
                quantiteSortie: l.quantiteSortie,
              })),
            );
            setSelectedConsumables(flatLines);
          }

          // Après : on bloque aussi pour A_CORRIGER
          if (["SOUMIS", "VALIDE", "A_CORRIGER"].includes(data.statut)) {
            setIsSubmitted(true);
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
    setForm((f) => {
      let updated = { ...f, [name]: value };
      if (name === "natureIntervention" && value === "SOUS_TRAITANT") {
        updated.natureResolution = "A_PLANIFIER";
      }
      return updated;
    });
    // Réinitialiser l’erreur pour ce champ
    setErrors((errs) => ({ ...errs, [name]: "" }));
  };

  // ─── Validation avant soumission ───────────────────────────────────────────

  const validateForm = (envoyer: boolean) => {
    const newErrors: Record<string, string> = {};
    if (!incident) return false;

    // dateDebut est obligatoire
    if (!form.dateDebut) {
      newErrors.dateDebut = "La date de début est requise.";
    } else {
      const debut = new Date(form.dateDebut);
      const creation = new Date(incident.dateCreation);
      if (debut < creation) {
        newErrors.dateDebut =
          "La date de début doit être ≥ la date de création de l'incident.";
      }
    }

    // Si IMMEDIATE, dateFin, diagnosticPanne, travailEffectue obligatoire
    if (form.natureResolution === "IMMEDIATE") {
      if (!form.dateFin) {
        newErrors.dateFin =
          "La date de fin est requise pour une intervention immédiate.";
      } else if (new Date(form.dateFin) < new Date(form.dateDebut)) {
        newErrors.dateFin = "La date de fin doit être après la date de début.";
      }
      if (!form.diagnosticPanne) {
        newErrors.diagnosticPanne = "Le diagnostic est requis.";
      }
      if (!form.travailEffectue) {
        newErrors.travailEffectue = "Le travail effectué est requis.";
      }
    }

    // Si SOUS-TRAITANT, vérifier téléphone externe valide
    if (form.natureIntervention === "SOUS_TRAITANT") {
      if (form.telephoneExterne) {
        const telPattern = /^[0-9+\-\s]{6,20}$/;
        if (!telPattern.test(form.telephoneExterne)) {
          newErrors.telephoneExterne = "Numéro de téléphone invalide.";
        }
      }
    }

    // Vérifier quantités de consommables
    selectedConsumables.forEach((line, idx) => {
      if (!line.articleMagasinId) {
        newErrors[`consommable_${idx}`] = "Sélectionnez un article.";
      }
      if (line.quantiteSortie < 1) {
        newErrors[`quantite_${idx}`] = "Quantité minimale de 1.";
      } else {
        const art = articles.find((a) => a.id === line.articleMagasinId);
        if (art && line.quantiteSortie > art.quantite) {
          newErrors[`quantite_${idx}`] = `Max ${art.quantite}.`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    setErrors((errs) => {
      const newErrs = { ...errs };
      delete newErrs[`consommable_${i}`];
      delete newErrs[`quantite_${i}`];
      return newErrs;
    });
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
    setErrors((errs) => {
      const newErrs = { ...errs };
      delete newErrs[`consommable_${index}`];
      delete newErrs[`quantite_${index}`];
      return newErrs;
    });
  };

  // ─── Soumission du rapport ─────────────────────────────────────────────────

  /**
   * @param envoyer – si true → statut = SOUMIS et création BonsSortie
   
   */
  const submitRapport = async (envoyer: boolean) => {
    if (!incidentId) return;
    if (!validateForm(envoyer)) return;

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
      telephoneExterne:
        form.natureIntervention === "SOUS_TRAITANT"
          ? form.telephoneExterne
          : undefined,
    };

    if (envoyer) {
      // Si le rapport existant est déjà en A_PLANIFIER, MOD_PLANIFIER ou INVALIDE → on passe en A_CORRIGER
      if (
        existing &&
        ["A_PLANIFIER", "MOD_PLANIFIER", "INVALIDE"].includes(existing.statut)
      ) {
        payloadRapport.statut = "A_CORRIGER";
      } else {
        // Sinon, première soumission ou autre cas → statut SOUMIS
        payloadRapport.statut = "SOUMIS";
      }
    }

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
        body: JSON.stringify({
          ...payloadRapport,
          statut: "SOUMIS",
        }),
      });
      if (!res.ok) {
        console.error("Erreur POST rapport", await res.text());
        return;
      }
      rapportSaved = await res.json();
    }

    // Si on “envoie” (statut = A_CORRIGER ou SOUMIS), créer les bons de sortie
    if (envoyer && selectedConsumables.length) {
      const dto = {
        rapportId: rapportSaved.id,
        lignes: selectedConsumables, // [{ articleMagasinId, quantiteSortie }, …]
      };
      const res = await fetch(`http://localhost:2000/bons-sortie`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(dto),
      });
      if (!res.ok) {
        console.error("Erreur création bon de sortie", await res.text());
      } else {
        setIsSubmitted(true);
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
      {/* ─── En-tête + Onglets (modernisé) ─────────────────────────────────────── */}
      <div className="flex flex-col items-start justify-between gap-4 bg-gray-50 p-8 md:flex-row md:items-center">
        <h1 className="text-4xl font-extrabold text-gray-800">
          Rapport d'incident
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setView("fiche")}
            className={`rounded-full px-5 py-2 font-medium transition ${
              view === "fiche"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Fiche
          </button>
          <button
            onClick={() => setView("rapport")}
            className={`rounded-full px-5 py-2 font-medium transition ${
              view === "rapport"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Rapport
          </button>
        </div>
      </div>

      <div className="p-8">
        {view === "fiche" ? (
          // ─── “Fiche” mode ─────────────────────────────────────────────────────────
          <div className="grid gap-8 lg:grid-cols-2">
            <motion.div
              className="rounded-2xl bg-white p-6 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-5 flex items-center space-x-2 text-xl font-semibold text-gray-800">
                <FiUser className="text-blue-600" />
                <span>Identification</span>
              </div>
              <div className="space-y-5">
                {[
                  { label: "Nom", value: incident.createur.nom },
                  { label: "Prénom", value: incident.createur.prenom },
                  { label: "Rôle", value: incident.createur.roles },
                  { label: "Direction", value: incident.createur.direction },
                  { label: "Fonction", value: incident.createur.fonction },
                ].map(({ label, value }) => (
                  <div key={label} className="space-y-1">
                    <div className="text-sm font-medium text-gray-600">
                      {label}
                    </div>
                    <input
                      readOnly
                      value={value}
                      className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="rounded-2xl bg-white p-6 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-5 flex items-center space-x-2 text-xl font-semibold text-gray-800">
                <FiClipboard className="text-blue-600" />
                <span>Détails</span>
              </div>
              <div className="space-y-5">
                <div className="flex items-center space-x-4 text-gray-700">
                  <FiCalendar className="text-blue-600" />
                  <span>Date : {dateInter}</span>
                  <FiClock className="text-blue-600" />
                  <span>Heure : {timeInter}</span>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      label: "Famille MI",
                      value: incident.equipement.familleMI,
                    },
                    { label: "Type", value: incident.equipement.equipmentType },
                    {
                      label: "N° de série",
                      value: incident.equipement.numeroSerie,
                    },
                    {
                      label: "Emplacement",
                      value: incident.equipement.emplacement.nom,
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="space-y-1">
                      <div className="text-sm font-medium text-gray-600">
                        {label}
                      </div>
                      <input
                        readOnly
                        value={value}
                        className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800"
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-600">État</div>
                  <input
                    readOnly
                    value={incident.equipement.etat}
                    className="w-32 rounded-xl border border-gray-300 bg-gray-50 px-3 py-1 text-center text-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-600">
                    Description
                  </div>
                  <textarea
                    readOnly
                    defaultValue={incident.description}
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-600">
                    Échéance
                  </div>
                  <input
                    readOnly
                    type="date"
                    value={new Date(incident.echeance)
                      .toISOString()
                      .slice(0, 10)}
                    className="w-48 rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-600">
                    Pièces jointes
                  </div>
                  <ul className="list-inside list-disc space-y-1 text-blue-600">
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
                {existing?.bonSorties && existing.bonSorties.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-600">
                      Bons de sortie liés
                    </div>
                    <ul className="space-y-2">
                      {existing.bonSorties!.map((bon) => (
                        <li key={bon.id} className="space-y-1">
                          {/* Show the sortie date */}
                          <div className="text-sm font-medium text-gray-600">
                            Sortie du{" "}
                            {new Date(bon.dateSortie).toLocaleDateString(
                              "fr-FR",
                            )}
                          </div>
                          {/* List each line */}
                          <ul className="list-inside list-disc text-gray-800">
                            {bon.lignes.map((l) => (
                              <li key={l.id}>
                                {l.articleMagasin.designation} – Quantité :{" "}
                                {l.quantiteSortie}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        ) : (
          // ─── “Formulaire Rapport” mode ─────────────────────────────────────────
          <motion.div
            className="mx-auto w-full max-w-3xl space-y-12 rounded-2xl bg-white p-10 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="mb-8 flex items-center text-3xl font-bold text-gray-800">
              <FiClipboard className="mr-3 text-blue-600" />
              Rapport d’intervention
            </h2>

            {/* Section 1: Diagnostic */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FiClipboard className="text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-800">
                  Diagnostic de la panne
                </h3>
              </div>
              <textarea
                name="diagnosticPanne"
                rows={4}
                value={form.diagnosticPanne}
                onChange={handleChange}
                className={`w-full rounded-2xl border border-gray-300 bg-gray-50 px-5 py-3 text-gray-900 placeholder-gray-400 transition 
                          focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
                            isSubmitted ? "cursor-not-allowed opacity-60" : ""
                          }`}
                placeholder="Décris ici le diagnostic…"
                disabled={isSubmitted}
              />
              {errors.diagnosticPanne && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.diagnosticPanne}
                </p>
              )}
            </div>

            {/* Section 2: Nature Intervention */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FiUser className="text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-800">
                  Nature de l’intervention
                </h3>
              </div>
              <div className="flex items-center gap-8">
                {(["INTERNE", "SOUS_TRAITANT"] as const).map((opt) => (
                  <label key={opt} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="natureIntervention"
                      value={opt}
                      checked={form.natureIntervention === opt}
                      onChange={handleChange}
                      disabled={isSubmitted}
                      className="h-6 w-6 accent-blue-600"
                    />
                    <span className="text-gray-800">
                      {opt === "INTERNE" ? "Interne" : "Sous-traitant"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Section 3: Infos Externes (Sous-traitant) */}
            {form.natureIntervention === "SOUS_TRAITANT" && (
              <div className="space-y-5 rounded-2xl border-l-4 border-blue-100 bg-blue-50 px-8 py-6">
                <h4 className="text-lg font-medium italic text-gray-700">
                  Informations sur le technicien externe
                </h4>
                {[
                  {
                    name: "prenomExterne",
                    label: "Prénom externe",
                    icon: FiUser,
                  },
                  { name: "nomExterne", label: "Nom externe", icon: FiUser },
                  {
                    name: "emailExterne",
                    label: "Email externe",
                    icon: FiMail,
                    type: "email",
                  },
                  {
                    name: "telephoneExterne",
                    label: "Téléphone externe",
                    icon: FiPhone,
                  },
                ].map(({ name, label, icon: Icon, type }) => (
                  <div key={name} className="space-y-1">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Icon className="mr-2 text-blue-600" />
                      {label}
                    </label>
                    <input
                      type={(type as string) || "text"}
                      name={name}
                      value={(form as any)[name]}
                      onChange={handleChange}
                      className={`w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 transition 
                                focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
                                  isSubmitted
                                    ? "cursor-not-allowed opacity-60"
                                    : ""
                                }`}
                      placeholder={label}
                      disabled={isSubmitted}
                    />
                    {errors[name] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors[name]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Section 4: Nature Résolution */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FiCalendar className="text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-800">
                  Nature de la résolution
                </h3>
              </div>
              <div className="flex items-center gap-8">
                {(["IMMEDIATE", "A_PLANIFIER"] as const).map((opt) => (
                  <label key={opt} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="natureResolution"
                      value={opt}
                      checked={form.natureResolution === opt}
                      onChange={handleChange}
                      disabled={
                        isSubmitted ||
                        (form.natureIntervention === "SOUS_TRAITANT" &&
                          opt === "IMMEDIATE")
                      }
                      className="h-6 w-6 accent-blue-600"
                    />
                    <span className="text-gray-800">
                      {opt === "IMMEDIATE" ? "Immédiate" : "À planifier"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Section 5: Dates */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FiCalendar className="mr-2 text-blue-600" />
                  Date début
                </label>
                <input
                  type="datetime-local"
                  name="dateDebut"
                  value={form.dateDebut}
                  onChange={handleChange}
                  className={`w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 placeholder-gray-400 transition 
                            focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
                              isSubmitted ? "cursor-not-allowed opacity-60" : ""
                            }`}
                  disabled={isSubmitted}
                />
                {errors.dateDebut && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.dateDebut}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FiCalendar className="mr-2 text-blue-600" />
                  Date fin
                </label>
                <input
                  type="datetime-local"
                  name="dateFin"
                  value={form.dateFin}
                  onChange={handleChange}
                  className={`w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 placeholder-gray-400 transition 
                            focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
                              isSubmitted ? "cursor-not-allowed opacity-60" : ""
                            }`}
                  disabled={isSubmitted}
                />
                {errors.dateFin && (
                  <p className="mt-1 text-sm text-red-600">{errors.dateFin}</p>
                )}
              </div>
            </div>

            {/* Section 6: Durée */}
            {form.dateDebut &&
              form.dateFin &&
              new Date(form.dateFin) >= new Date(form.dateDebut) && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FiClock className="text-blue-600" />
                    <h4 className="text-sm font-medium text-gray-700">
                      Durée (heures)
                    </h4>
                  </div>
                  <input
                    readOnly
                    value={computeDurationHours(form.dateDebut, form.dateFin)}
                    className="w-32 rounded-2xl border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900"
                  />
                </div>
              )}

            {/* Section 7: Coût */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FiClock className="text-blue-600" />
                <h4 className="text-sm font-medium text-gray-700">Coût (DT)</h4>
              </div>
              <input
                type="number"
                name="cout"
                step="0.01"
                value={form.cout}
                onChange={handleChange}
                className={`w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 placeholder-gray-400 transition 
                          focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
                            isSubmitted ? "cursor-not-allowed opacity-60" : ""
                          }`}
                disabled={isSubmitted}
              />
            </div>

            {/* Section 8: Travail Effectué */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FiClipboard className="text-blue-600" />
                <h4 className="text-sm font-medium text-gray-700">
                  Travail effectué
                </h4>
              </div>
              <textarea
                name="travailEffectue"
                rows={4}
                value={form.travailEffectue}
                onChange={handleChange}
                className={`w-full rounded-2xl border border-gray-300 bg-gray-50 px-5 py-3 text-gray-900 placeholder-gray-400 transition 
                          focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
                            isSubmitted ? "cursor-not-allowed opacity-60" : ""
                          }`}
                placeholder="Décris ici le travail effectué…"
                disabled={isSubmitted}
              />
              {errors.travailEffectue && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.travailEffectue}
                </p>
              )}
            </div>

            {/* Section 9: Consommables */}
            <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                  <FiPlus className="text-blue-600" />
                  <span>Consommables</span>
                </div>
                {!isSubmitted && (
                  <button
                    onClick={addConsumableLine}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                  >
                    Ajouter une ligne
                  </button>
                )}
              </div>

              {selectedConsumables.length > 0 ? (
                selectedConsumables.map((line, idx) => {
                  const allArticles: ArticleMagasin[] = Array.isArray(articles)
                    ? articles
                    : [];
                  const availableArticles = filterTypeId
                    ? allArticles.filter(
                        (a) => a.typeConsommable.id === filterTypeId,
                      )
                    : allArticles;
                  const selectedArticle = allArticles.find(
                    (art) => art.id === line.articleMagasinId,
                  );
                  const maxQty = selectedArticle ? selectedArticle.quantite : 1;

                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-1 gap-6 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-4"
                    >
                      {/* Type consommable */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Type
                        </label>
                        <select
                          name="typeConsommable"
                          value={filterTypeId}
                          onChange={(e) => setFilterTypeId(e.target.value)}
                          className={`w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 placeholder-gray-400 transition 
                                    focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
                                      isSubmitted
                                        ? "cursor-not-allowed opacity-60"
                                        : ""
                                    }`}
                          disabled={isSubmitted}
                        >
                          <option value="">-- Type consommable --</option>
                          {types.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Désignation article */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
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
                          className={`w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 placeholder-gray-400 transition 
                                    focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
                                      isSubmitted
                                        ? "cursor-not-allowed opacity-60"
                                        : ""
                                    }`}
                          disabled={isSubmitted}
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
                        {errors[`consommable_${idx}`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors[`consommable_${idx}`]}
                          </p>
                        )}
                      </div>

                      {/* Quantité à sortir */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
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
                          className={`w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 placeholder-gray-400 transition 
                                    focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
                                      isSubmitted
                                        ? "cursor-not-allowed opacity-60"
                                        : ""
                                    }`}
                          disabled={isSubmitted}
                        />
                        {errors[`quantite_${idx}`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors[`quantite_${idx}`]}
                          </p>
                        )}
                      </div>

                      {/* Bouton Supprimer */}
                      {!isSubmitted && (
                        <div className="flex items-end justify-center">
                          <button
                            onClick={() => removeConsumableLine(idx)}
                            className="rounded-full bg-red-600 p-2 text-white transition hover:bg-red-700"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">
                  Aucun consommable sélectionné.
                </p>
              )}
            </div>

            {/* Bouton Envoyer (Soumis) */}
            {!isSubmitted && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowModal(true)}
                  className="rounded-2xl bg-green-600 px-6 py-3 text-lg font-medium text-white transition hover:bg-green-700"
                >
                  Envoyer
                </button>
              </div>
            )}

            {/* Modal de confirmation d’envoi */}
            {showModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/50">
                <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-2xl">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Confirmer l’envoi ?
                  </h3>
                  <p className="text-gray-600">
                    Voulez-vous vraiment envoyer ce rapport ?
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setShowModal(false)}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-100"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => submitRapport(true)}
                      className="rounded-lg bg-green-600 px-5 py-2 text-white transition hover:bg-green-700"
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
