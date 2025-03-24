"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import React, { useState } from "react";

export default function RapportIncidentForm() {
  const [formData, setFormData] = useState({
    // Informations générales de l'incident
    incidentTitle: "",
    incidentDescription: "",
    incidentDate: "",
    incidentTime: "",
    localisation: "",
    // Nature de l'incident (radio buttons)
    nature: "",
    // Symptômes (checkboxes)
    symptomes: [],
    // Remarque du demandeur (affiché en cas de maintenance corrective)
    remarque: "",
  });

  // Options pour les radio buttons et checkboxes
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Gestion des checkbox pour "symptomes"
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
    // Logique d'envoi du rapport (ex. via fetch ou axios)
    console.log("Données du rapport d'incident:", formData);
    // Réinitialisation du formulaire après soumission (si nécessaire)
    setFormData({
      incidentTitle: "",
      incidentDescription: "",
      incidentDate: "",
      incidentTime: "",
      localisation: "",
      nature: "",
      symptomes: [],
      remarque: "",
    });
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-3xl rounded-md bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Rapport d'incident
        </h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Titre et description de l'incident */}
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

          {/* Nature de l'incident (Radio Buttons) */}
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

          {/* Symptômes (Checkboxes) */}
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

          {/* Remarque du demandeur (affiché uniquement en cas de maintenance corrective) */}
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
                placeholder="Saisissez ici toute remarque complémentaire du demandeur en cas d'intervention de maintenance corrective"
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              ></textarea>
            </div>
          )}

          <div className="text-center">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              Envoyer le rapport
            </button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
}
