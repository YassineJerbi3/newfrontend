"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useState } from "react";

// Read-only Intervention Form (first form)
function ReadOnlyInterventionForm() {
  // Données pré-remplies
  const formData = {
    nom: "Dupont",
    prenom: "Jean",
    fonction: "admin", // Example value
    direction: "informatique", // Example value
    priorite: "urgent", // Options: urgent, normale, basse
    applicatifConcerne: "site web de l'escs", // Example value
    description: "Ceci est la description détaillée de la demande.",
    dateInterventionSouhaitee: "2025-05-01", // Format: YYYY-MM-DD
    applicationWebConcerne: ["site web de l'escs", "edupage"], // Example selections
  };

  const fonctionOptions = ["admin", "professeur", "responsable"];
  const directionOptions = [
    "informatique",
    "administratif",
    "technique",
    "gestion",
    "économie",
  ];
  const prioriteOptions = ["urgent", "normale", "basse"];
  const applicatifConcerneOptions = [
    "site web de l'escs",
    "edupage",
    "compte google professionnel (usf)",
  ];
  const applicationWebConcerneOptions = [
    "site web de l'escs",
    "page facebook de l'escs",
    "edupage",
    "chaine youtube escs",
  ];

  return (
    <div className="mx-auto max-w-3xl rounded-md bg-white p-6 shadow-lg">
      <h1 className="mb-6 text-center text-3xl font-bold">
        Déclaration d'intervention (Lecture seule)
      </h1>
      <form className="pointer-events-none select-none space-y-8">
        {/* Identification du demandeur */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            Identification du demandeur
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="nom"
                className="block text-sm font-medium text-gray-700"
              >
                Nom
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="prenom"
                className="block text-sm font-medium text-gray-700"
              >
                Prénom
              </label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
            </div>
          </div>
          <div className="mt-4">
            <label
              htmlFor="fonction"
              className="block text-sm font-medium text-gray-700"
            >
              Fonction
            </label>
            <select
              id="fonction"
              name="fonction"
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
          <div className="mt-4">
            <label
              htmlFor="direction"
              className="block text-sm font-medium text-gray-700"
            >
              Direction/Département/Service
            </label>
            <select
              id="direction"
              name="direction"
              value={formData.direction}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            >
              {directionOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Informations sur l'intervention */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            Informations sur l'intervention
          </h2>
          <div className="mt-4">
            <p className="block text-sm font-medium text-gray-700">Priorité</p>
            <div className="mt-2 flex space-x-4">
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
                  <span className="ml-2">{option}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <p className="block text-sm font-medium text-gray-700">
              Applicatif Concerné
            </p>
            <div className="mt-2 flex space-x-4">
              {applicatifConcerneOptions.map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="applicatifConcerne"
                    value={option}
                    checked={formData.applicatifConcerne === option}
                    disabled
                    className="h-4 w-4 border-gray-300 text-blue-600"
                  />
                  <span className="ml-2">{option}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description détaillée de la demande
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              readOnly
              rows="5"
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            ></textarea>
          </div>
          <div className="mt-4">
            <label
              htmlFor="piecesJointes"
              className="block text-sm font-medium text-gray-700"
            >
              Pièces jointes
            </label>
            <input
              type="file"
              id="piecesJointes"
              name="piecesJointes"
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100"
            />
          </div>
          <div className="mt-4">
            <p className="block text-sm font-medium text-gray-700">
              Application Web Concernée
            </p>
            <div className="mt-2 flex flex-wrap gap-4">
              {applicationWebConcerneOptions.map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="applicationWebConcerne"
                    value={option}
                    checked={formData.applicationWebConcerne.includes(option)}
                    disabled
                    className="h-4 w-4 border-gray-300 text-blue-600"
                  />
                  <span className="ml-2">{option}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <label
              htmlFor="dateInterventionSouhaitee"
              className="block text-sm font-medium text-gray-700"
            >
              Date d'intervention souhaitée
            </label>
            <input
              type="date"
              id="dateInterventionSouhaitee"
              name="dateInterventionSouhaitee"
              value={formData.dateInterventionSouhaitee}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
        </section>
      </form>
    </div>
  );
}

// Editable Rapport Form (second form) with new fields
function EditableRapportForm() {
  const [formData, setFormData] = useState({
    nomDemandeur: "",
    telephone: "",
    date: "",
    heure: "",
    communication: [],
    service: "",
    travauxDemandes: "",
    travauxFaisables: "", // We'll use a radio selection for exclusive choice "oui"/"non"
    dateIntervention: "",
    heureIntervention: "",
    travauxRealises: "",
  });

  const communicationOptions = ["demande en ligne", "Email"];
  const serviceOptions = ["a", "b", "c", "d"];
  const travauxFaisablesOptions = ["oui", "non"];

  // Handles for text, date, time inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Checkbox handler for communication options
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      if (checked) {
        return { ...prev, communication: [...prev.communication, value] };
      } else {
        return {
          ...prev,
          communication: prev.communication.filter((item) => item !== value),
        };
      }
    });
  };

  // Radio button handler for travauxFaisables (oui/non)
  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Rapport data submitted:", formData);
    // Reset form if needed
    setFormData({
      nomDemandeur: "",
      telephone: "",
      date: "",
      heure: "",
      communication: [],
      service: "",
      travauxDemandes: "",
      travauxFaisables: "",
      dateIntervention: "",
      heureIntervention: "",
      travauxRealises: "",
    });
  };

  return (
    <div className="mx-auto max-w-3xl rounded-md bg-white p-6 shadow-lg">
      <h1 className="mb-6 text-center text-3xl font-bold">
        Rapport Applicatif
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Nom demandeur */}
        <div>
          <label
            htmlFor="nomDemandeur"
            className="block text-sm font-medium text-gray-700"
          >
            Nom demandeur
          </label>
          <input
            type="text"
            id="nomDemandeur"
            name="nomDemandeur"
            value={formData.nomDemandeur}
            onChange={handleChange}
            placeholder="Entrez le nom du demandeur"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Téléphone */}
        <div>
          <label
            htmlFor="telephone"
            className="block text-sm font-medium text-gray-700"
          >
            Téléphone
          </label>
          <input
            type="text"
            id="telephone"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            placeholder="Entrez le numéro de téléphone"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Date et Heure */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="heure"
              className="block text-sm font-medium text-gray-700"
            >
              Heure
            </label>
            <input
              type="time"
              id="heure"
              name="heure"
              value={formData.heure}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Communication (checkboxes) */}
        <div>
          <p className="block text-sm font-medium text-gray-700">
            Communication
          </p>
          <div className="mt-2 flex space-x-4">
            {communicationOptions.map((option) => (
              <label key={option} className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="communication"
                  value={option}
                  checked={formData.communication.includes(option)}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Service/Département/Laboratoire */}
        <div>
          <label
            htmlFor="service"
            className="block text-sm font-medium text-gray-700"
          >
            Service/Département/Laboratoire
          </label>
          <select
            id="service"
            name="service"
            value={formData.service}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Sélectionnez</option>
            {serviceOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Travaux demandés */}
        <div>
          <label
            htmlFor="travauxDemandes"
            className="block text-sm font-medium text-gray-700"
          >
            Travaux demandés
          </label>
          <textarea
            id="travauxDemandes"
            name="travauxDemandes"
            value={formData.travauxDemandes}
            onChange={handleChange}
            placeholder="Décrivez les travaux demandés..."
            rows="5"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          ></textarea>
        </div>

        {/* Travaux demandés faisables */}
        <div>
          <p className="block text-sm font-medium text-gray-700">
            Travaux demandés faisables
          </p>
          <div className="mt-2 flex space-x-4">
            {travauxFaisablesOptions.map((option) => (
              <label key={option} className="inline-flex items-center">
                <input
                  type="radio"
                  name="travauxFaisables"
                  value={option}
                  checked={formData.travauxFaisables === option}
                  onChange={handleRadioChange}
                  required
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Date et Heure d'intervention */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="dateIntervention"
              className="block text-sm font-medium text-gray-700"
            >
              Date d'intervention
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
          <div>
            <label
              htmlFor="heureIntervention"
              className="block text-sm font-medium text-gray-700"
            >
              Heure d'intervention
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
        </div>

        {/* Travaux réalisés et résultat final après intervention */}
        <div>
          <label
            htmlFor="travauxRealises"
            className="block text-sm font-medium text-gray-700"
          >
            Travaux réalisés et résultat final après intervention
          </label>
          <textarea
            id="travauxRealises"
            name="travauxRealises"
            value={formData.travauxRealises}
            onChange={handleChange}
            placeholder="Décrivez les travaux réalisés et le résultat final..."
            rows="5"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          ></textarea>
        </div>

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

// Composant principal avec navigation par onglets
export default function CombinedForms() {
  const [activeTab, setActiveTab] = useState("readOnly");

  return (
    <DefaultLayout>
      <div className="p-6">
        <div className="mb-6 flex justify-center space-x-4">
          <button
            onClick={() => setActiveTab("readOnly")}
            className={`rounded-md px-4 py-2 font-semibold ${activeTab === "readOnly" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
          >
            Intervention (Lecture seule)
          </button>
          <button
            onClick={() => setActiveTab("rapport")}
            className={`rounded-md px-4 py-2 font-semibold ${activeTab === "rapport" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
          >
            Rapport Applicatif
          </button>
        </div>
        {activeTab === "readOnly" ? (
          <ReadOnlyInterventionForm />
        ) : (
          <EditableRapportForm />
        )}
      </div>
    </DefaultLayout>
  );
}
