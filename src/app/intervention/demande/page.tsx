"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useState } from "react";

export default function DemandePublicationForm() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    fonction: "",
    direction: "",
    publicationTitle: "",
    publicationType: "",
    typeOther: "",
    resume: "",
    file: [], // multiple files
    applicationWeb: [],
    pageCible: "",
    publicationDateSouhaitee: "",
  });

  // State to hold simulated upload progress per file name.
  const [uploadProgress, setUploadProgress] = useState({});

  const fonctionOptions = ["professor", "admin", "technicien", "responsable"];
  const directionOptions = ["informatique", "gestion", "economie"];
  const publicationTypeOptions = ["article", "annonce", "actualite", "autre"];
  const applicationWebOptions = [
    "site web de l'ESCS",
    "page Facebook de l'ESCS",
    "Edupage",
    "chaine youtube ESCS",
  ];

  // Simulated upload progress for a file.
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
    if (name === "file") {
      // Convert the FileList to an array and merge with existing files.
      const newFiles = Array.from(files);
      newFiles.forEach((file) => {
        simulateUpload(file);
      });
      setFormData((prev) => ({
        ...prev,
        file: [...prev.file, ...newFiles],
      }));
    } else if (name === "applicationWeb") {
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          applicationWeb: [...prev.applicationWeb, value],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          applicationWeb: prev.applicationWeb.filter((app) => app !== value),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle radio buttons.
  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "publicationType" && value !== "autre" && { typeOther: "" }),
    }));
  };

  // Helper function to get file extension in lowercase.
  const getFileExtension = (file) => {
    const parts = file.name.split(".");
    return parts[parts.length - 1].toLowerCase();
  };

  // Return a JSX element for non-image file icon display.
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Demande de publication soumise :", formData);
    setFormData({
      nom: "",
      prenom: "",
      fonction: "",
      direction: "",
      publicationTitle: "",
      publicationType: "",
      typeOther: "",
      resume: "",
      file: [],
      applicationWeb: [],
      pageCible: "",
      publicationDateSouhaitee: "",
    });
    setUploadProgress({});
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="mb-8 text-center text-3xl font-bold">
          Demande de Publication
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

          {/* Section: Informations sur la publication */}
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
                onChange={handleChange}
                placeholder="Entrez le titre de la publication"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                      onChange={handleRadioChange}
                      required
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
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
                    onChange={handleChange}
                    placeholder="Indiquez le type de publication"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                onChange={handleChange}
                placeholder="Entrez le résumé de la publication..."
                rows="6"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                  onChange={handleChange}
                  multiple
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
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
                      {uploadProgress[file.name] != null && (
                        <div className="mt-1 w-full">
                          <div className="h-1 w-full rounded bg-gray-300">
                            <div
                              className="h-1 rounded bg-blue-600"
                              style={{ width: `${uploadProgress[file.name]}%` }}
                            ></div>
                          </div>
                          <p className="mt-1 text-center text-xs text-gray-600">
                            {uploadProgress[file.name]}%
                          </p>
                        </div>
                      )}
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
                      onChange={handleChange}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Page ou section cible */}
            <div className="mb-4">
              <label
                htmlFor="pageCible"
                className="mb-1 block text-sm font-bold uppercase text-gray-900"
              >
                Page ou section cible
              </label>
              <input
                type="text"
                id="pageCible"
                name="pageCible"
                value={formData.pageCible}
                onChange={handleChange}
                placeholder="Indiquez la page ou section cible"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
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
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Bouton d'envoi */}
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
