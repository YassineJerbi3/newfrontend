"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import React, { useState } from "react";

export default function DeclarationInterventionForm() {
  const [formData, setFormData] = useState({
    // Informations personnelles
    nom: "",
    prenom: "",
    fonction: "",
    departement: "",
    // Détails de l'équipement
    equipementId: "",
    numeroSerie: "",
    fabricant: "",
    equipLocalisation: "",
    typeObjet: [],
    etat: "",
    // Détails de l'incident
    incidentDate: "",
    incidentTime: "",
    description: "",
  });

  const departementOptions = ["Informatique", "Maintenance", "Administration"];
  const typeObjetOptions = ["Ordinateur", "Imprimante", "Scanner", "Autre"];
  const etatOptions = ["Fonctionnel", "Défectueux", "En réparation"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Gestion des checkbox pour "typeObjet"
    if (name === "typeObjet") {
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          typeObjet: [...prev.typeObjet, value],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          typeObjet: prev.typeObjet.filter((item) => item !== value),
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Logique d'envoi des données (ex: via fetch/axios)
    console.log("Données du formulaire :", formData);
    // Réinitialiser le formulaire
    setFormData({
      nom: "",
      prenom: "",
      fonction: "",
      departement: "",
      equipementId: "",
      numeroSerie: "",
      fabricant: "",
      equipLocalisation: "",
      typeObjet: [],
      etat: "",
      incidentDate: "",
      incidentTime: "",
      description: "",
    });
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-3xl rounded-md bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Déclaration d'intervention d'incident
        </h1>
        <form onSubmit={handleSubmit} className="space-y-8">
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
                  onChange={handleChange}
                  required
                  placeholder="Votre nom"
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
                  name="prenom"
                  id="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  placeholder="Votre prénom"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                  onChange={handleChange}
                  required
                  placeholder="Votre fonction"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                        onChange={handleRadioChange}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
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
                  onChange={handleChange}
                  placeholder="ID de l'équipement"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                  onChange={handleChange}
                  placeholder="Numéro de série"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                  onChange={handleChange}
                  placeholder="Nom du fabricant"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                  onChange={handleChange}
                  placeholder="Localisation de l'équipement"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                      onChange={handleChange}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
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
                      onChange={handleRadioChange}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{etat}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Détails de l'incident */}
          <section>
            <h2 className="mb-4 text-xl font-semibold">
              Détails de l'incident
            </h2>
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
                  name="incidentTime"
                  id="incidentTime"
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
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Décrivez en détail l'incident..."
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              ></textarea>
            </div>
          </section>

          <div className="text-center">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Envoyer la déclaration
            </button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
}
