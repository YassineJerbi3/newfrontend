"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useState } from "react";

export default function DemandePublicationForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    faculty: "escs", // Faculty remains as is
    publicationTitle: "",
    publicationDescription: "",
    publicationDate: "",
    publicationTime: "",
    publicationType: "", // e.g. Article, Annonce, Événement (radio buttons)
    options: [], // e.g. Inclure image, Recevoir notification (checkboxes)
    remarks: "",
  });

  // Options for radio buttons and checkboxes
  const publicationTypeOptions = ["Article", "Annonce", "Événement"];
  const optionOptions = ["Inclure image", "Recevoir notification"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "options") {
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          options: [...prev.options, value],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          options: prev.options.filter((opt) => opt !== value),
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
    // Insert submission logic here (ex: API call)
    console.log("Demande de publication soumise :", formData);
    // Reset form (faculty remains "escs")
    setFormData({
      fullName: "",
      email: "",
      faculty: "escs",
      publicationTitle: "",
      publicationDescription: "",
      publicationDate: "",
      publicationTime: "",
      publicationType: "",
      options: [],
      remarks: "",
    });
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-3xl rounded-md bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Demande de Publication
        </h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Nom complet */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700"
            >
              Nom complet
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Entrez votre nom complet"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Entrez votre email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Faculté (pré-rempli) */}
          <div>
            <label
              htmlFor="faculty"
              className="block text-sm font-medium text-gray-700"
            >
              Faculté
            </label>
            <input
              type="text"
              id="faculty"
              name="faculty"
              value={formData.faculty}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Titre de la publication */}
          <div>
            <label
              htmlFor="publicationTitle"
              className="block text-sm font-medium text-gray-700"
            >
              Titre de la publication
            </label>
            <input
              type="text"
              id="publicationTitle"
              name="publicationTitle"
              value={formData.publicationTitle}
              onChange={handleChange}
              placeholder="Entrez le titre de la publication"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Description de la publication */}
          <div>
            <label
              htmlFor="publicationDescription"
              className="block text-sm font-medium text-gray-700"
            >
              Description de la publication
            </label>
            <textarea
              id="publicationDescription"
              name="publicationDescription"
              value={formData.publicationDescription}
              onChange={handleChange}
              placeholder="Décrivez le contenu de la publication"
              rows="4"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* Date et Heure de publication */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="publicationDate"
                className="block text-sm font-medium text-gray-700"
              >
                Date de publication
              </label>
              <input
                type="date"
                id="publicationDate"
                name="publicationDate"
                value={formData.publicationDate}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="publicationTime"
                className="block text-sm font-medium text-gray-700"
              >
                Heure de publication
              </label>
              <input
                type="time"
                id="publicationTime"
                name="publicationTime"
                value={formData.publicationTime}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Type de publication (Radio Buttons) */}
          <div>
            <p className="block text-sm font-medium text-gray-700">
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
                  <span className="ml-2">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Options supplémentaires (Checkboxes) */}
          <div>
            <p className="block text-sm font-medium text-gray-700">
              Options supplémentaires
            </p>
            <div className="mt-2 flex flex-wrap gap-4">
              {optionOptions.map((opt, index) => (
                <label key={index} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="options"
                    value={opt}
                    checked={formData.options.includes(opt)}
                    onChange={handleChange}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Remarques */}
          <div>
            <label
              htmlFor="remarks"
              className="block text-sm font-medium text-gray-700"
            >
              Remarques
            </label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Entrez vos remarques (optionnel)"
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              Envoyer la demande
            </button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
}
