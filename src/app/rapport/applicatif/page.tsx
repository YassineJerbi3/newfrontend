"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useState } from "react";

export default function RapportApplicatifForm() {
  // Initial state for the form fields – adjust these keys to match your form image's fields.
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    description: "",
    reportDate: "",
    reportTime: "",
    issueType: "", // e.g. Bug, Feature Request, General Inquiry (radio buttons)
    options: [], // e.g. Include Screenshot, Request Callback, Subscribe to Newsletter (checkboxes)
    additionalComments: "",
  });

  // Options for radio buttons and checkboxes
  const issueTypeOptions = ["Bug", "Feature Request", "General Inquiry"];
  const optionOptions = [
    "Include Screenshot",
    "Request Callback",
    "Subscribe to Newsletter",
  ];

  // Generic change handler for text, date, time, etc.
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "options") {
      // Manage checkboxes for options
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          options: [...prev.options, value],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          options: prev.options.filter((item) => item !== value),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handler for radio button changes
  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Insert your submission logic here (e.g. API call using fetch or axios)
    console.log("Submitted form data:", formData);
    // Optionally reset the form fields
    setFormData({
      fullName: "",
      email: "",
      subject: "",
      description: "",
      reportDate: "",
      reportTime: "",
      issueType: "",
      options: [],
      additionalComments: "",
    });
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-3xl rounded-md bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Rapport Applicatif
        </h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Full Name */}
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

          {/* Subject */}
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700"
            >
              Sujet
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Entrez le sujet"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez le problème en détail"
              rows="4"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="reportDate"
                className="block text-sm font-medium text-gray-700"
              >
                Date
              </label>
              <input
                type="date"
                id="reportDate"
                name="reportDate"
                value={formData.reportDate}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="reportTime"
                className="block text-sm font-medium text-gray-700"
              >
                Heure
              </label>
              <input
                type="time"
                id="reportTime"
                name="reportTime"
                value={formData.reportTime}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Issue Type (Radio Buttons) */}
          <div>
            <p className="block text-sm font-medium text-gray-700">
              Type de problème
            </p>
            <div className="mt-2 flex space-x-4">
              {issueTypeOptions.map((option, index) => (
                <label key={index} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="issueType"
                    value={option}
                    checked={formData.issueType === option}
                    onChange={handleRadioChange}
                    required
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Options (Checkboxes) */}
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

          {/* Additional Comments */}
          <div>
            <label
              htmlFor="additionalComments"
              className="block text-sm font-medium text-gray-700"
            >
              Commentaires supplémentaires
            </label>
            <textarea
              id="additionalComments"
              name="additionalComments"
              value={formData.additionalComments}
              onChange={handleChange}
              placeholder="Saisissez ici des commentaires additionnels"
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            ></textarea>
          </div>

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
