"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useState } from "react";

export default function DemandePublicationForm() {
  // Données préremplies en mode lecture
  const [formData] = useState({
    nom: "Dupont",
    prenom: "Jean",
    fonction: "admin",
    direction: "informatique",
    publicationTitle: "Titre de publication",
    publicationType: "article", // Possibles: "article", "annonce", "actualite", "autre"
    typeOther: "",
    resume: "Ceci est le résumé de la publication.",
    file: [], // Aucun fichier prérempli
    applicationWeb: ["site web de l'ESCS", "Edupage"],
    pageCible: "Page ou section cible exemple",
    publicationDateSouhaitee: "2025-06-15",
  });

  const fonctionOptions = ["professor", "admin", "technicien", "responsable"];
  const directionOptions = ["informatique", "gestion", "economie"];
  const publicationTypeOptions = ["article", "annonce", "actualite", "autre"];
  const applicationWebOptions = [
    "site web de l'ESCS",
    "page Facebook de l'ESCS",
    "Edupage",
    "chaine youtube ESCS",
  ];

  // Cette fonction est utilisée pour afficher une icône pour les fichiers non-images (si besoin)
  const getFileExtension = (file) => {
    const parts = file.name.split(".");
    return parts[parts.length - 1].toLowerCase();
  };

  const renderFileIcon = (file) => {
    const ext = getFileExtension(file);
    let label = "Fichier";
    if (ext === "pdf") label = "PDF";
    else if (ext === "doc" || ext === "docx") label = "Word";
    else if (ext === "xls" || ext === "xlsx") label = "Excel";
    return (
      <div className="flex h-24 w-24 items-center justify-center rounded border border-gray-300 bg-white">
        <span className="text-xs text-gray-600">{label}</span>
      </div>
    );
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-3xl rounded-md bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Demande de Publication
        </h1>

        {/* Formulaire en mode lecture */}
        <form className="space-y-8">
          {/* Section : Identification du demandeur */}
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
                readOnly
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
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
                readOnly
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
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
                disabled
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              >
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
                disabled
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              >
                {directionOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section : Informations sur la publication */}
          <div>
            <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-800">
              Informations sur la publication
            </h2>
            <div className="mb-4">
              <label
                htmlFor="publicationTitle"
                className="mb-1 block text-sm font-bold uppercase text-gray-900"
              >
                Titre de publication
              </label>
              <input
                type="text"
                id="publicationTitle"
                name="publicationTitle"
                value={formData.publicationTitle}
                readOnly
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
            </div>
            <div className="mb-4">
              <p className="mb-1 block text-sm font-bold uppercase text-gray-900">
                Type de publication
              </p>
              <div className="mt-2 flex space-x-4">
                {publicationTypeOptions.map((option, index) => (
                  <label key={index} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="publicationType"
                      value={option}
                      checked={formData.publicationType === option}
                      disabled
                      readOnly
                      className="h-4 w-4 border-gray-300 text-blue-600"
                    />
                    <span className="ml-2 capitalize">{option}</span>
                  </label>
                ))}
              </div>
              {formData.publicationType === "autre" && (
                <div className="mt-2">
                  <label
                    htmlFor="typeOther"
                    className="mb-1 block text-sm font-bold uppercase text-gray-900"
                  >
                    Veuillez préciser le type
                  </label>
                  <input
                    type="text"
                    id="typeOther"
                    name="typeOther"
                    value={formData.typeOther}
                    readOnly
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
                  />
                </div>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="resume"
                className="mb-1 block text-sm font-bold uppercase text-gray-900"
              >
                Résumé de la publication
              </label>
              <textarea
                id="resume"
                name="resume"
                value={formData.resume}
                readOnly
                disabled
                rows="6"
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              ></textarea>
            </div>

            {/* Pièces jointes */}
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
                    Glissez-déposez des fichiers ici ou cliquez pour
                    sélectionner
                  </span>
                </div>
                <input
                  id="file"
                  name="file"
                  type="file"
                  multiple
                  disabled
                  readOnly
                  className="absolute inset-0 h-full w-full cursor-not-allowed opacity-0"
                />
              </div>
              {formData.file.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {formData.file.map((file, index) => (
                    <div key={index} className="flex flex-col items-center">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="h-24 w-24 rounded object-cover"
                        />
                      ) : (
                        renderFileIcon(file)
                      )}
                      <p className="mt-2 break-all text-center text-xs text-gray-700">
                        {file.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Application web concernée */}
            <div className="mb-4">
              <label className="mb-1 block text-sm font-bold uppercase text-gray-900">
                Application web concernée
              </label>
              <div className="mt-2 flex flex-wrap gap-4">
                {applicationWebOptions.map((option, index) => (
                  <label key={index} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="applicationWeb"
                      value={option}
                      checked={formData.applicationWeb.includes(option)}
                      disabled
                      readOnly
                      className="h-4 w-4 border-gray-300 text-blue-600"
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date de publication souhaitée */}
            <div>
              <label
                htmlFor="publicationDateSouhaitee"
                className="mb-1 block text-sm font-bold uppercase text-gray-900"
              >
                Date de publication souhaitée
              </label>
              <input
                type="date"
                id="publicationDateSouhaitee"
                name="publicationDateSouhaitee"
                value={formData.publicationDateSouhaitee}
                readOnly
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
            </div>
          </div>

          {/* Bouton d'envoi, désactivé en lecture */}
          <div className="text-center">
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-md bg-blue-600 px-6 py-3 text-white opacity-50"
            >
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
}
