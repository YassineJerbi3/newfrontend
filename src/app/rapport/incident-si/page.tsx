"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useState } from "react";

// Formulaire Déclaration d'intervention en lecture seule
function ReadOnlyDeclarationIntervention() {
  // Exemple de données pré-remplies (à adapter)
  const formData = {
    nom: "Martin",
    prenom: "Alice",
    fonction: "Technicienne",
    departement: "Maintenance",
    equipementId: "EQP-00123",
    numeroSerie: "SN-987654",
    fabricant: "Fabricant X",
    equipLocalisation: "Bâtiment A",
    typeObjet: ["Ordinateur"],
    etat: "Fonctionnel",
    incidentDate: "2025-03-27",
    incidentTime: "09:45",
    description: "Problème détecté sur l’équipement lors d’une inspection.",
  };

  const departementOptions = ["Informatique", "Maintenance", "Administration"];
  const typeObjetOptions = ["Ordinateur", "Imprimante", "Scanner", "Autre"];
  const etatOptions = ["Fonctionnel", "Défectueux", "En réparation"];

  return (
    <div className="mx-auto max-w-3xl rounded-md bg-white p-6 shadow-lg">
      <h1 className="mb-6 text-center text-3xl font-bold">
        Déclaration d'intervention d'incident (Lecture seule)
      </h1>
      <form className="pointer-events-none select-none space-y-8">
        {/* Informations Personnelles */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Informations Personnelles
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            <div>
              <label
                htmlFor="fonction"
                className="block text-sm font-medium text-gray-700"
              >
                Fonction
              </label>
              <input
                type="text"
                name="fonction"
                id="fonction"
                value={formData.fonction}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
            </div>
            <div>
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Département / Service
              </span>
              <div className="flex space-x-4">
                {departementOptions.map((dept) => (
                  <label key={dept} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="departement"
                      value={dept}
                      checked={formData.departement === dept}
                      disabled
                      className="h-4 w-4 border-gray-300 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">{dept}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Détails de l'équipement */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Détails de l'équipement
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="equipementId"
                className="block text-sm font-medium text-gray-700"
              >
                Identifiant de l'équipement
              </label>
              <input
                type="text"
                name="equipementId"
                id="equipementId"
                value={formData.equipementId}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="numeroSerie"
                className="block text-sm font-medium text-gray-700"
              >
                Numéro de série
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
            <div>
              <label
                htmlFor="equipLocalisation"
                className="block text-sm font-medium text-gray-700"
              >
                Localisation
              </label>
              <input
                type="text"
                name="equipLocalisation"
                id="equipLocalisation"
                value={formData.equipLocalisation}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
            </div>
          </div>
          <div className="mt-4">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Type d'objet
            </span>
            <div className="flex flex-wrap gap-4">
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
          </div>
          <div className="mt-4">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              État
            </span>
            <div className="flex space-x-4">
              {etatOptions.map((etat) => (
                <label key={etat} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="etat"
                    value={etat}
                    checked={formData.etat === etat}
                    disabled
                    className="h-4 w-4 border-gray-300 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">{etat}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Détails de l'incident */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">Détails de l'incident</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="incidentDate"
                className="block text-sm font-medium text-gray-700"
              >
                Date
              </label>
              <input
                type="date"
                name="incidentDate"
                id="incidentDate"
                value={formData.incidentDate}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="incidentTime"
                className="block text-sm font-medium text-gray-700"
              >
                Heure
              </label>
              <input
                type="time"
                name="incidentTime"
                id="incidentTime"
                value={formData.incidentTime}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
            </div>
          </div>
          <div className="mt-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description détaillée
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
        </section>
      </form>
    </div>
  );
}

// Formulaire Rapport d'incident éditable avec décision de réparation
function EditableRapportIncident() {
  const [formData, setFormData] = useState({
    incidentTitle: "Panne serveur principal",
    incidentDescription:
      "Le serveur principal ne répond plus aux requêtes, impactant l'ensemble des services.",
    incidentDate: "2025-03-27",
    incidentTime: "10:00",
    localisation: "Data center - Salle A",
    nature: "Maintenance corrective",
    symptomes: ["Erreur système", "Défaillance matérielle"],
    remarque: "Intervention urgente nécessaire.",
    interventionDecision: "Réparation immédiate", // Nouvel état
  });

  const natureOptions = [
    "Maintenance corrective",
    "Maintenance préventive",
    "Autre",
  ];
  const symptomeOptions = [
    "Erreur système",
    "Défaillance matérielle",
    "Problème de communication",
    "Temps de réponse élevé",
    "Autre",
  ];
  const interventionOptions = [
    "Réparation immédiate",
    "Planification",
    "Besoin de technicien externe",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "symptomes") {
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          symptomes: [...prev.symptomes, value],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          symptomes: prev.symptomes.filter((item) => item !== value),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

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
    // Vous pouvez ajouter ici la logique d'envoi (fetch/axios, etc.)
    // Réinitialiser le formulaire si nécessaire
  };

  // Définir le libellé du bouton en fonction de la décision d'intervention
  const getButtonLabel = () => {
    switch (formData.interventionDecision) {
      case "Réparation immédiate":
        return "Valider";
      case "Planification":
        return "Planifier";
      case "Besoin de technicien externe":
        return "Demander technicien externe";
      default:
        return "Valider";
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-md bg-white p-6 shadow-lg">
      <h1 className="mb-6 text-center text-3xl font-bold">
        Rapport d'incident
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Titre et description */}
        <div>
          <label
            htmlFor="incidentTitle"
            className="block text-sm font-medium text-gray-700"
          >
            Titre de l'incident
          </label>
          <input
            type="text"
            id="incidentTitle"
            name="incidentTitle"
            value={formData.incidentTitle}
            onChange={handleChange}
            placeholder="Saisissez le titre de l'incident"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="incidentDescription"
            className="block text-sm font-medium text-gray-700"
          >
            Description de l'incident
          </label>
          <textarea
            id="incidentDescription"
            name="incidentDescription"
            value={formData.incidentDescription}
            onChange={handleChange}
            placeholder="Décrivez en détail l'incident"
            rows="4"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          ></textarea>
        </div>

        {/* Date, heure et localisation */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="incidentDate"
              className="block text-sm font-medium text-gray-700"
            >
              Date
            </label>
            <input
              type="date"
              id="incidentDate"
              name="incidentDate"
              value={formData.incidentDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="incidentTime"
              className="block text-sm font-medium text-gray-700"
            >
              Heure
            </label>
            <input
              type="time"
              id="incidentTime"
              name="incidentTime"
              value={formData.incidentTime}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="localisation"
              className="block text-sm font-medium text-gray-700"
            >
              Localisation
            </label>
            <input
              type="text"
              id="localisation"
              name="localisation"
              value={formData.localisation}
              onChange={handleChange}
              placeholder="Lieu de l'incident"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Nature de l'incident (radio) */}
        <div>
          <p className="block text-sm font-medium text-gray-700">
            Nature de l'incident
          </p>
          <div className="mt-2 flex space-x-4">
            {natureOptions.map((option, index) => (
              <label key={index} className="inline-flex items-center">
                <input
                  type="radio"
                  name="nature"
                  value={option}
                  checked={formData.nature === option}
                  onChange={handleRadioChange}
                  required
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Symptômes (checkboxes) */}
        <div>
          <p className="block text-sm font-medium text-gray-700">
            Symptômes observés
          </p>
          <div className="mt-2 flex flex-wrap gap-4">
            {symptomeOptions.map((symptome, index) => (
              <label key={index} className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="symptomes"
                  value={symptome}
                  checked={formData.symptomes.includes(symptome)}
                  onChange={handleChange}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">{symptome}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Décision du technicien */}
        <div>
          <p className="block text-sm font-medium text-gray-700">
            Intervention du technicien
          </p>
          <div className="mt-2 flex space-x-4">
            {interventionOptions.map((option, index) => (
              <label key={index} className="inline-flex items-center">
                <input
                  type="radio"
                  name="interventionDecision"
                  value={option}
                  checked={formData.interventionDecision === option}
                  onChange={handleRadioChange}
                  required
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Remarque (affiché en cas de "Maintenance corrective") */}
        {formData.nature === "Maintenance corrective" && (
          <div>
            <label
              htmlFor="remarque"
              className="block text-sm font-medium text-gray-700"
            >
              Remarque du demandeur
            </label>
            <textarea
              id="remarque"
              name="remarque"
              value={formData.remarque}
              onChange={handleChange}
              placeholder="Saisissez ici une remarque complémentaire"
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            ></textarea>
          </div>
        )}

        <div className="text-center">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            {getButtonLabel()}
          </button>
        </div>
      </form>
    </div>
  );
}

// Composant principal combinant les deux formulaires dans des onglets
export default function CombinedIncidentForms() {
  const [activeTab, setActiveTab] = useState("declaration");

  return (
    <DefaultLayout>
      <div className="p-6">
        <div className="mb-6 flex justify-center space-x-4">
          <button
            onClick={() => setActiveTab("declaration")}
            className={`rounded-md px-4 py-2 font-semibold ${
              activeTab === "declaration"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Déclaration d'intervention
          </button>
          <button
            onClick={() => setActiveTab("rapport")}
            className={`rounded-md px-4 py-2 font-semibold ${
              activeTab === "rapport"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
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
