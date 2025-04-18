"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useState } from "react";

export default function DemandeInterventionForm() {
  const [formData, setFormData] = useState({
    // Identification du demandeur
    nom: "",
    prenom: "",
    fonction: "",
    direction: "",
    // Information sur l'intervention
    priorite: "",
    equipement: "",
    numSerie: "",
    fabricant: "",
    localisation: "",
    typeObjet: [],
    typeObjetAutre: "",
    etat: "",
    description: "",
    pieceJointe: null, // single file – change to array if needed
    echeance: "",
  });

  // Simulated file upload progress state.
  const [uploadProgress, setUploadProgress] = useState({});

  // List options
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
    "unite centrale",
    "ecran",
    "logiciel",
    "resau",
    "imprimante",
    "autre",
  ];
  const etatOptions = ["en arret", "en marche"];

  // Simulated file upload function.
  const simulateUpload = (file) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
    }, 300);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    // Handling file input (only one file for now)
    if (name === "pieceJointe") {
      const file = files[0];
      if (file) {
        simulateUpload(file);
        setFormData((prev) => ({ ...prev, pieceJointe: file }));
      }
    }
    // Handling checkbox for "typeObjet"
    else if (name === "typeObjet") {
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
    }
    // Other fields (text, date, etc.)
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle radio button changes.
  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Demande d'intervention soumise :", formData);
    // Reset form data and progress.
    setFormData({
      nom: "",
      prenom: "",
      fonction: "",
      direction: "",
      priorite: "",
      equipement: "",
      numSerie: "",
      fabricant: "",
      localisation: "",
      typeObjet: [],
      typeObjetAutre: "",
      etat: "",
      description: "",
      pieceJointe: null,
      echeance: "",
    });
    setUploadProgress({});
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="mb-8 text-center text-3xl font-bold">
          Demande d'Intervention
        </h1>
        {/* Overall form container */}
        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-md border border-gray-300 bg-white p-6 shadow-sm"
        >
          {/* Section: Identification du demandeur */}
          <div>
            <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-800">
              Identification du demandeur
            </h2>
            <div className="mb-4">
              <label
                htmlFor="nom"
                className="mb-1 block text-sm font-bold uppercase text-gray-900"
              >
                Nom
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Entrez votre nom"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="prenom"
                className="mb-1 block text-sm font-bold uppercase text-gray-900"
              >
                Prénom
              </label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                placeholder="Entrez votre prénom"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="fonction"
                className="mb-1 block text-sm font-bold uppercase text-gray-900"
              >
                Fonction
              </label>
              <select
                id="fonction"
                name="fonction"
                value={formData.fonction}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Sélectionnez votre fonction</option>
                {fonctionOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="direction"
                className="mb-1 block text-sm font-bold uppercase text-gray-900"
              >
                Direction/Département/Service
              </label>
              <select
                id="direction"
                name="direction"
                value={formData.direction}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Sélectionnez votre direction</option>
                {directionOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section: Information sur l'intervention */}
          <div>
            <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-800">
              Information sur l'intervention
            </h2>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-bold uppercase text-gray-900">
                Priorité
              </label>
              <div className="mt-2 flex space-x-4">
                {prioriteOptions.map((option, index) => (
                  <label key={index} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="priorite"
                      value={option}
                      checked={formData.priorite === option}
                      onChange={handleRadioChange}
                      required
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label
                htmlFor="equipement"
                className="mb-1 block text-sm font-bold uppercase text-gray-900"
              >
                Équipement
              </label>
              <input
                type="text"
                id="equipement"
                name="equipement"
                value={formData.equipement}
                onChange={handleChange}
                placeholder="Entrez l'équipement concerné"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="numSerie"
                className="mb-1 block text-sm font-bold uppercase text-gray-900"
              >
                N° de série de l'équipement
              </label>
              <input
                type="text"
                id="numSerie"
                name="numSerie"
                value={formData.numSerie}
                onChange={handleChange}
                placeholder="Entrez le numéro de série"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="fabricant"
                className="mb-1 block text-sm font-bold uppercase text-gray-900"
              >
                Fabricant
              </label>
              <input
                type="text"
                id="fabricant"
                name="fabricant"
                value={formData.fabricant}
                onChange={handleChange}
                placeholder="Indiquez le fabricant"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="localisation"
                className="mb-1 block text-sm font-bold uppercase text-gray-900"
              >
                Localisation de l'équipement
              </label>
              <input
                type="text"
                id="localisation"
                name="localisation"
                value={formData.localisation}
                onChange={handleChange}
                placeholder="Indiquez la localisation"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-bold uppercase text-gray-900">
                Type d'objet
              </label>
              <div className="mt-2 flex flex-wrap gap-4">
                {typeObjetOptions.map((option, index) => (
                  <label key={index} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="typeObjet"
                      value={option}
                      checked={formData.typeObjet.includes(option)}
                      onChange={handleChange}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
              {formData.typeObjet.includes("autre") && (
                <div className="mt-2">
                  <label
                    htmlFor="typeObjetAutre"
                    className="mb-1 block text-sm font-bold uppercase text-gray-900"
                  >
                    Précisez le type d'objet
                  </label>
                  <input
                    type="text"
                    id="typeObjetAutre"
                    name="typeObjetAutre"
                    value={formData.typeObjetAutre}
                    onChange={handleChange}
                    placeholder="Indiquez le type d'objet"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-bold uppercase text-gray-900">
                État
              </label>
              <div className="mt-2 flex space-x-4">
                {etatOptions.map((option, index) => (
                  <label key={index} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="etat"
                      value={option}
                      checked={formData.etat === option}
                      onChange={handleRadioChange}
                      required
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-bold uppercase text-gray-900"
              >
                Description détaillée de la panne
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez la panne en détail..."
                rows="6"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-bold uppercase text-gray-900">
                Pièces jointes
              </label>
              <div className="relative mt-1 flex items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H20a4 4 0 00-4 4v24a4 4 0 004 4h8a4 4 0 004-4V12a4 4 0 00-4-4z"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="mt-2 block text-sm text-gray-600">
                    Glissez-déposez un fichier ou cliquez pour sélectionner
                  </span>
                </div>
                <input
                  id="pieceJointe"
                  name="pieceJointe"
                  type="file"
                  onChange={handleChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>
              {formData.pieceJointe &&
                uploadProgress[formData.pieceJointe.name] != null && (
                  <div className="mt-4">
                    <p className="break-all text-sm text-gray-700">
                      {formData.pieceJointe.name}
                    </p>
                    <div className="mt-1 w-full">
                      <div className="h-1 w-full rounded bg-gray-300">
                        <div
                          className="h-1 rounded bg-blue-600"
                          style={{
                            width: `${uploadProgress[formData.pieceJointe.name]}%`,
                          }}
                        ></div>
                      </div>
                      <p className="mt-1 text-center text-xs text-gray-600">
                        {uploadProgress[formData.pieceJointe.name]}%
                      </p>
                    </div>
                  </div>
                )}
            </div>
            <div>
              <label
                htmlFor="echeance"
                className="mb-1 block text-sm font-bold uppercase text-gray-900"
              >
                Échéance de réparation
              </label>
              <input
                type="date"
                id="echeance"
                name="echeance"
                value={formData.echeance}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
}
