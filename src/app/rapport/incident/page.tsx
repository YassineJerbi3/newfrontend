"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useState } from "react";

// Read-only form (Déclaration d'intervention)
function ReadOnlyDeclarationIntervention() {
  // Exemple de données pré-remplies (à adapter)
  const formData = {
    nom: "Martin",
    prenom: "Alice",
    fonction: "admin", // Options: admin, prof, responsable
    direction: "informatique", // Options: informatique, administratif, technique, gestion, economie
    priorite: "urgent", // Options: urgent, normale, basse
    equipement: "EQP-00123",
    numeroSerie: "SN-987654",
    fabricant: "Fabricant X",
    localisation: "Bâtiment A",
    typeObjet: ["unité centrale", "autre"], // multiple selections possible
    autreTypeObjet: "Périphérique", // affiché si "autre" est sélectionné
    etat: "en marche", // Options: en arrêt, en marche
    description: "Problème détecté sur l’équipement lors d’une inspection.",
    echeanceReparation: "2025-04-15", // Format yyyy-mm-dd
    // Pour "Pièces jointes", pas de pré-remplissage
  };

  const fonctionOptions = ["admin", "prof", "responsable"];
  const directionOptions = [
    "informatique",
    "administratif",
    "technique",
    "gestion",
    "economie",
  ];
  const prioriteOptions = ["urgent", "normale", "basse"];
  const typeObjetOptions = [
    "unité centrale",
    "écran",
    "logiciel",
    "réseau",
    "imprimante",
    "autre",
  ];
  const etatOptions = ["en arrêt", "en marche"];

  return (
    <div className="mx-auto max-w-3xl rounded-md bg-white p-6 shadow-lg">
      <h1 className="mb-6 text-center text-3xl font-bold">
        Déclaration d'intervention (Lecture seule)
      </h1>
      <form className="pointer-events-none select-none space-y-8">
        {/* Identification du demandeur */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Identification du demandeur
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Nom */}
            <div>
              <label
                htmlFor="nom"
                className="block text-sm font-medium text-gray-700"
              >
                Nom
              </label>
              <input
                type="text"
                name="nom"
                id="nom"
                value={formData.nom}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
            </div>
            {/* Prénom */}
            <div>
              <label
                htmlFor="prenom"
                className="block text-sm font-medium text-gray-700"
              >
                Prénom
              </label>
              <input
                type="text"
                name="prenom"
                id="prenom"
                value={formData.prenom}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
            </div>
            {/* Fonction */}
            <div>
              <label
                htmlFor="fonction"
                className="block text-sm font-medium text-gray-700"
              >
                Fonction
              </label>
              <select
                name="fonction"
                id="fonction"
                value={formData.fonction}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              >
                {fonctionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            {/* Direction / Département / Service */}
            <div>
              <label
                htmlFor="direction"
                className="block text-sm font-medium text-gray-700"
              >
                Direction / Département / Service
              </label>
              <select
                name="direction"
                id="direction"
                value={formData.direction}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              >
                {directionOptions.map((dir) => (
                  <option key={dir} value={dir}>
                    {dir}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Information sur l'intervention */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Information sur l'intervention
          </h2>
          {/* Priorité */}
          <div>
            <span className="block text-sm font-medium text-gray-700">
              Priorité
            </span>
            <div className="mt-1 flex space-x-4">
              {prioriteOptions.map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="priorite"
                    value={option}
                    checked={formData.priorite === option}
                    disabled
                    className="h-4 w-4 border-gray-300 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Détails équipement */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Équipement */}
            <div>
              <label
                htmlFor="equipement"
                className="block text-sm font-medium text-gray-700"
              >
                Équipement
              </label>
              <input
                type="text"
                name="equipement"
                id="equipement"
                value={formData.equipement}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
            </div>
            {/* N° de série équipement */}
            <div>
              <label
                htmlFor="numeroSerie"
                className="block text-sm font-medium text-gray-700"
              >
                N° de série équipement
              </label>
              <input
                type="text"
                name="numeroSerie"
                id="numeroSerie"
                value={formData.numeroSerie}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
            </div>
            {/* Fabricant */}
            <div>
              <label
                htmlFor="fabricant"
                className="block text-sm font-medium text-gray-700"
              >
                Fabricant
              </label>
              <input
                type="text"
                name="fabricant"
                id="fabricant"
                value={formData.fabricant}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
            </div>
            {/* Localisation de l'équipement */}
            <div>
              <label
                htmlFor="localisation"
                className="block text-sm font-medium text-gray-700"
              >
                Localisation de l'équipement
              </label>
              <input
                type="text"
                name="localisation"
                id="localisation"
                value={formData.localisation}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
            </div>
          </div>
          {/* Type d'objet */}
          <div className="mt-4">
            <span className="block text-sm font-medium text-gray-700">
              Type d'objet
            </span>
            <div className="mt-1 flex flex-wrap gap-4">
              {typeObjetOptions.map((type) => (
                <label key={type} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="typeObjet"
                    value={type}
                    checked={formData.typeObjet.includes(type)}
                    disabled
                    className="h-4 w-4 border-gray-300 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
            {/* Afficher la zone de saisie si "autre" est sélectionné */}
            {formData.typeObjet.includes("autre") && (
              <div className="mt-4">
                <label
                  htmlFor="autreTypeObjet"
                  className="block text-sm font-medium text-gray-700"
                >
                  Précisez l'objet
                </label>
                <input
                  type="text"
                  name="autreTypeObjet"
                  id="autreTypeObjet"
                  value={formData.autreTypeObjet || ""}
                  readOnly
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
                />
              </div>
            )}
          </div>
          {/* État */}
          <div className="mt-4">
            <span className="block text-sm font-medium text-gray-700">
              État
            </span>
            <div className="mt-1 flex space-x-4">
              {etatOptions.map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="etat"
                    value={option}
                    checked={formData.etat === option}
                    disabled
                    className="h-4 w-4 border-gray-300 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Description détaillée de la panne */}
          <div className="mt-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description détaillée de la panne
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              readOnly
              rows="5"
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            ></textarea>
          </div>
          {/* Pièces jointes */}
          <div className="mt-4">
            <label
              htmlFor="piecesJointes"
              className="block text-sm font-medium text-gray-700"
            >
              Pièces jointes
            </label>
            <input
              type="file"
              name="piecesJointes"
              id="piecesJointes"
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100"
            />
          </div>
          {/* Échéance de réparation */}
          <div className="mt-4">
            <label
              htmlFor="echeanceReparation"
              className="block text-sm font-medium text-gray-700"
            >
              Échéance de réparation
            </label>
            <input
              type="date"
              name="echeanceReparation"
              id="echeanceReparation"
              value={formData.echeanceReparation}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
        </section>
      </form>
    </div>
  );
}

// Editable form for incident report (Rapport d'incident) with updated fields
function EditableRapportIncident() {
  const [formData, setFormData] = useState({
    diagnosticPanne: "",
    natureIntervention: "",
    priorite: "",
    dateIntervention: "",
    heureIntervention: "",
    dureeIntervention: "",
    coutIntervention: "",
    dateArret: "",
    heureArret: "",
    travailEffectue: "",
    remarqueDemandeur: "",
  });

  // Handler for text, date and time inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler for radio changes (for both nature intervention and priorité)
  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Données du rapport d'incident:", formData);
    // You can reset the form if needed
    setFormData({
      diagnosticPanne: "",
      natureIntervention: "",
      priorite: "",
      dateIntervention: "",
      heureIntervention: "",
      dureeIntervention: "",
      coutIntervention: "",
      dateArret: "",
      heureArret: "",
      travailEffectue: "",
      remarqueDemandeur: "",
    });
  };

  return (
    <div className="mx-auto max-w-3xl rounded-md bg-white p-6 shadow-lg">
      <h1 className="mb-6 text-center text-3xl font-bold">
        Rapport d'incident
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section Diagnostic */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">Diagnostic</h2>
          {/* Diagnostic de la panne */}
          <div>
            <label
              htmlFor="diagnosticPanne"
              className="block text-sm font-medium text-gray-700"
            >
              Diagnostic de la panne
            </label>
            <textarea
              id="diagnosticPanne"
              name="diagnosticPanne"
              value={formData.diagnosticPanne}
              onChange={handleChange}
              placeholder="Décrivez le diagnostic de la panne..."
              rows="5"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            ></textarea>
          </div>
          {/* Nature intervention */}
          <div className="mt-4">
            <span className="block text-sm font-medium text-gray-700">
              Nature intervention
            </span>
            <div className="mt-1 flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="natureIntervention"
                  value="interne"
                  checked={formData.natureIntervention === "interne"}
                  onChange={handleRadioChange}
                  required
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Interne</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="natureIntervention"
                  value="sous-traitant"
                  checked={formData.natureIntervention === "sous-traitant"}
                  onChange={handleRadioChange}
                  required
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Sous-traitant</span>
              </label>
            </div>
          </div>
          {/* Priorité */}
          <div className="mt-4">
            <span className="block text-sm font-medium text-gray-700">
              Priorité
            </span>
            <div className="mt-1 flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="priorite"
                  value="immédiate"
                  checked={formData.priorite === "immédiate"}
                  onChange={handleRadioChange}
                  required
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Immédiate</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="priorite"
                  value="a planifier"
                  checked={formData.priorite === "a planifier"}
                  onChange={handleRadioChange}
                  required
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">À planifier</span>
              </label>
            </div>
          </div>
        </section>

        {/* Section Rapport de l'intervention */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Rapport de l'intervention
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Date intervention */}
            <div>
              <label
                htmlFor="dateIntervention"
                className="block text-sm font-medium text-gray-700"
              >
                Date intervention
              </label>
              <input
                type="date"
                id="dateIntervention"
                name="dateIntervention"
                value={formData.dateIntervention}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {/* Heure intervention */}
            <div>
              <label
                htmlFor="heureIntervention"
                className="block text-sm font-medium text-gray-700"
              >
                Heure intervention
              </label>
              <input
                type="time"
                id="heureIntervention"
                name="heureIntervention"
                value={formData.heureIntervention}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {/* Durée intervention */}
            <div>
              <label
                htmlFor="dureeIntervention"
                className="block text-sm font-medium text-gray-700"
              >
                Durée intervention
              </label>
              <input
                type="text"
                id="dureeIntervention"
                name="dureeIntervention"
                value={formData.dureeIntervention}
                onChange={handleChange}
                placeholder="Exemple: 2h30"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Coût intervention */}
            <div>
              <label
                htmlFor="coutIntervention"
                className="block text-sm font-medium text-gray-700"
              >
                Coût intervention
              </label>
              <input
                type="text"
                id="coutIntervention"
                name="coutIntervention"
                value={formData.coutIntervention}
                onChange={handleChange}
                placeholder="Exemple: 150€"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {/* Temps d'arrêt (date et heure) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Temps d'arrêt
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  name="dateArret"
                  value={formData.dateArret}
                  onChange={handleChange}
                  required
                  className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="time"
                  name="heureArret"
                  value={formData.heureArret}
                  onChange={handleChange}
                  required
                  className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          {/* Travail effectué */}
          <div className="mt-4">
            <label
              htmlFor="travailEffectue"
              className="block text-sm font-medium text-gray-700"
            >
              Travail effectué
            </label>
            <textarea
              id="travailEffectue"
              name="travailEffectue"
              value={formData.travailEffectue}
              onChange={handleChange}
              placeholder="Décrivez le travail effectué..."
              rows="4"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            ></textarea>
          </div>
          {/* Remarque du demandeur (pour maintenance corrective) */}
          <div className="mt-4">
            <label
              htmlFor="remarqueDemandeur"
              className="block text-sm font-medium text-gray-700"
            >
              Remarque du demandeur
            </label>
            <textarea
              id="remarqueDemandeur"
              name="remarqueDemandeur"
              value={formData.remarqueDemandeur}
              onChange={handleChange}
              placeholder="Saisissez ici une remarque complémentaire..."
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            ></textarea>
          </div>
        </section>

        <div className="text-center">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Valider
          </button>
        </div>
      </form>
    </div>
  );
}

// Main component combining both forms in tabs
export default function CombinedIncidentForms() {
  const [activeTab, setActiveTab] = useState("declaration");

  return (
    <DefaultLayout>
      <div className="p-6">
        <div className="mb-6 flex justify-center space-x-4">
          <button
            onClick={() => setActiveTab("declaration")}
            className={`rounded-md px-4 py-2 font-semibold ${activeTab === "declaration" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
          >
            Déclaration d'intervention
          </button>
          <button
            onClick={() => setActiveTab("rapport")}
            className={`rounded-md px-4 py-2 font-semibold ${activeTab === "rapport" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
          >
            Rapport d'incident
          </button>
        </div>
        {activeTab === "declaration" ? (
          <ReadOnlyDeclarationIntervention />
        ) : (
          <EditableRapportIncident />
        )}
      </div>
    </DefaultLayout>
  );
}
