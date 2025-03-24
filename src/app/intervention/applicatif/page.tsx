"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import React, { useState } from "react";

export default function InterventionApplicatifForm() {
  const [formData, setFormData] = useState({
    // Informations personnelles
    nom: "",
    prenom: "",
    fonction: "",
    departement: "",
    // Détails applicatifs
    applicationName: "",
    applicationVersion: "",
    incidentId: "",
    environnement: "",
    problemTypes: [],
    // Détails de l'incident
    incidentDate: "",
    incidentTime: "",
    description: "",
  });

  const departementOptions = ["Développement", "Support", "QA"];
  const environnementOptions = ["Production", "Test", "Développement"];
  const problemTypesOptions = [
    "Erreur UI",
    "Performance",
    "Sécurité",
    "Connectivité",
    "Autre",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Gestion des checkbox pour "problemTypes"
    if (name === "problemTypes") {
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          problemTypes: [...prev.problemTypes, value],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          problemTypes: prev.problemTypes.filter((item) => item !== value),
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
    // Logique d'envoi des données (ex: via fetch ou axios)
    console.log("Données du formulaire :", formData);
    // Réinitialisation du formulaire
    setFormData({
      nom: "",
      prenom: "",
      fonction: "",
      departement: "",
      applicationName: "",
      applicationVersion: "",
      incidentId: "",
      environnement: "",
      problemTypes: [],
      incidentDate: "",
      incidentTime: "",
      description: "",
    });
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-3xl rounded-md bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Déclaration d'intervention applicative
        </h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations personnelles */}
          <div>
            <h2 className="mb-4 text-2xl font-semibold">
              Informations personnelles
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
                  onChange={handleChange}
                  placeholder="Votre nom"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                  onChange={handleChange}
                  placeholder="Votre prénom"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              <input
                type="text"
                id="fonction"
                name="fonction"
                value={formData.fonction}
                onChange={handleChange}
                placeholder="Votre fonction"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="mt-4">
              <p className="block text-sm font-medium text-gray-700">
                Département/Service
              </p>
              <div className="mt-2 flex space-x-4">
                {departementOptions.map((dept, index) => (
                  <label key={index} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="departement"
                      value={dept}
                      checked={formData.departement === dept}
                      onChange={handleRadioChange}
                      required
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">{dept}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Détails applicatifs */}
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Détails applicatifs</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="applicationName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nom de l'application
                </label>
                <input
                  type="text"
                  id="applicationName"
                  name="applicationName"
                  value={formData.applicationName}
                  onChange={handleChange}
                  placeholder="Nom de l'application"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="applicationVersion"
                  className="block text-sm font-medium text-gray-700"
                >
                  Version
                </label>
                <input
                  type="text"
                  id="applicationVersion"
                  name="applicationVersion"
                  value={formData.applicationVersion}
                  onChange={handleChange}
                  placeholder="Version de l'application"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label
                htmlFor="incidentId"
                className="block text-sm font-medium text-gray-700"
              >
                Identifiant de l'incident
              </label>
              <input
                type="text"
                id="incidentId"
                name="incidentId"
                value={formData.incidentId}
                onChange={handleChange}
                placeholder="ID de l'incident"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="mt-4">
              <p className="block text-sm font-medium text-gray-700">
                Environnement
              </p>
              <div className="mt-2 flex space-x-4">
                {environnementOptions.map((env, index) => (
                  <label key={index} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="environnement"
                      value={env}
                      checked={formData.environnement === env}
                      onChange={handleRadioChange}
                      required
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">{env}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <p className="block text-sm font-medium text-gray-700">
                Type de problème
              </p>
              <div className="mt-2 flex flex-wrap gap-4">
                {problemTypesOptions.map((type, index) => (
                  <label key={index} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="problemTypes"
                      value={type}
                      checked={formData.problemTypes.includes(type)}
                      onChange={handleChange}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Détails de l'incident */}
          <div>
            <h2 className="mb-4 text-2xl font-semibold">
              Détails de l'incident
            </h2>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="mt-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description détaillée
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez en détail l'incident applicatif"
                rows="4"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              Envoyer la déclaration
            </button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
}
