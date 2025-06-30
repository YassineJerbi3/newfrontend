// src/app/utilisateurs/ajouter/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { BureauDropdown } from "@/components/BureauDropdown";

// Composant réutilisable pour un champ texte
interface InputFieldProps {
  id: string;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fullWidth?: boolean;
}
const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  fullWidth = false,
}) => (
  <div className={fullWidth ? "sm:col-span-2" : ""}>
    <label
      htmlFor={id}
      className="mb-1 block text-sm font-medium text-gray-600"
    >
      {label} *
    </label>
    <input
      id={id}
      name={id}
      type={type}
      value={value}
      onChange={onChange}
      required
      className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-200"
    />
  </div>
);

// Composant réutilisable pour un select
interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  fullWidth?: boolean;
}
const SelectField: React.FC<SelectFieldProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  fullWidth = false,
}) => (
  <div className={fullWidth ? "sm:col-span-2" : ""}>
    <label
      htmlFor={id}
      className="mb-1 block text-sm font-medium text-gray-600"
    >
      {label} *
    </label>
    <select
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      required
      className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-200"
    >
      <option value="">{`Sélectionnez ${label.toLowerCase()}`}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

interface NewUserForm {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  roles: string;
  fonction: string;
  direction: string;
  bureauNom?: string;
}

export default function AddUserPage() {
  const [formData, setFormData] = useState<NewUserForm>({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    roles: "",
    fonction: "",
    direction: "",
    bureauNom: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bureaux, setBureaux] = useState<string[]>([]);
  const [loadingBureaux, setLoadingBureaux] = useState(true);

  const roleOptions = [
    "ADMINISTRATIF",
    "PROFESSOR",
    "RESPONSABLE SI",
    "TECHNICIEN",
  ];
  const fonctionOptions = ["MANAGER", "TECHNICIAN"];
  const directionOptions = ["IT", "HR", "FINANCE"];
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

  useEffect(() => {
    fetch("http://localhost:2000/emplacements/bureaux", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((list: { nom: string }[]) => setBureaux(list.map((e) => e.nom)))
      .catch(console.error)
      .finally(() => setLoadingBureaux(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // si c’est nom ou prenom et que la valeur ne correspond pas à la regex, on sort
    if (
      (name === "nom" || name === "prenom") &&
      value &&
      !nameRegex.test(value)
    ) {
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const { nom, prenom, email, password, roles, fonction, direction } =
      formData;
    if (
      !nom ||
      !prenom ||
      !email ||
      !password ||
      !roles ||
      !fonction ||
      !direction
    ) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      const res = await fetch("http://localhost:2000/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (res.status === 409) {
        const err = await res.json();
        throw new Error(err.message || "Email déjà utilisé");
      }
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.message || "Erreur serveur");
      }
      setSuccess(true);
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        password: "",
        roles: "",
        fonction: "",
        direction: "",
        bureauNom: "",
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gradient-to-tr from-gray-50 to-gray-100 px-6 py-12">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Page header */}
          <div className="text-center">
            <h1 className="text-5xl font-extrabold text-gray-800">
              Ajouter un Nouvel Utilisateur
            </h1>
          </div>

          {/* Feedback */}
          {error && (
            <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-700">
                Utilisateur créé avec succès !
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {/** SECTION 1 : IDENTITÉ **/}
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
              {/* Header */}
              <div className="bg-blue-50 py-3 text-center">
                <h2 className="text-xl font-semibold text-blue-700">
                  IDENTITÉ
                </h2>
              </div>
              {/* Body */}
              <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2">
                {/* Nom */}
                <div className="flex items-center space-x-3">
                  <span className="text-2xl text-blue-500">👤</span>
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    pattern="[A-Za-zÀ-ÖØ-öø-ÿ ]+"
                    title="Veuillez n'utiliser que des lettres et des espaces."
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    placeholder="Nom"
                    className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3
                               transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
                  />
                </div>

                {/* Prénom */}
                <div className="flex items-center space-x-3">
                  <span className="text-2xl text-blue-500">👤</span>
                  <input
                    id="prenom"
                    name="prenom"
                    type="text"
                    pattern="[A-Za-zÀ-ÖØ-öø-ÿ ]+"
                    title="Veuillez n'utiliser que des lettres et des espaces."
                    value={formData.prenom}
                    onChange={handleChange}
                    required
                    placeholder="Prénom"
                    className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3
                               transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
                  />
                </div>

                {/* Email */}
                <div className="flex items-center space-x-3 md:col-span-2">
                  <span className="text-2xl text-blue-500">✉️</span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Email"
                    className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3
                               transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
                  />
                </div>

                {/* Mot de passe */}
                <div className="flex items-center space-x-3 md:col-span-2">
                  <span className="text-2xl text-blue-500">🔒</span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Mot de passe"
                    className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3
                               transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>

            {/** SECTION 2 : RÔLE & EMPLACEMENT **/}
            <div className="overflow-visible rounded-2xl bg-white shadow-2xl">
              {/* Header */}
              <div className="bg-blue-50 py-3 text-center">
                <h2 className="text-xl font-semibold text-blue-700">
                  RÔLE & EMPLACEMENT
                </h2>
              </div>
              {/* Body */}
              <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2">
                {/* Rôle (rôle dans la faculté) */}
                <div className="flex items-center space-x-3">
                  <span className="text-2xl text-blue-500">🎓</span>
                  <select
                    id="roles"
                    name="roles"
                    value={formData.roles}
                    onChange={handleChange}
                    required
                    className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3
                               transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
                  >
                    <option value="">Sélectionnez rôle</option>
                    {roleOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fonction (fonction dans la faculté) */}
                <div className="flex items-center space-x-3">
                  <span className="text-2xl text-blue-500">📋</span>
                  <select
                    id="fonction"
                    name="fonction"
                    value={formData.fonction}
                    onChange={handleChange}
                    required
                    className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3
                               transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
                  >
                    <option value="">Sélectionnez fonction</option>
                    {fonctionOptions.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Direction (département dans la faculté) */}
                <div className="flex items-center space-x-3">
                  <span className="text-2xl text-blue-500">🏫</span>
                  <select
                    id="direction"
                    name="direction"
                    value={formData.direction}
                    onChange={handleChange}
                    required
                    className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3
                               transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
                  >
                    <option value="">Sélectionnez département</option>
                    {directionOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bureau (optionnel) */}
                <div className="flex items-center space-x-3 md:col-span-2">
                  <span className="text-2xl text-blue-500">📍</span>
                  <div className="flex-1">
                    <BureauDropdown
                      options={bureaux}
                      value={formData.bureauNom}
                      onChange={(v) =>
                        setFormData((f) => ({ ...f, bureauNom: v }))
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="text-right">
              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-4 text-xl font-bold text-white shadow-2xl transition hover:scale-105 focus:ring-4 focus:ring-blue-200"
              >
                Ajouter l’utilisateur
              </button>
            </div>
          </form>
        </div>
      </div>
    </DefaultLayout>
  );
}
