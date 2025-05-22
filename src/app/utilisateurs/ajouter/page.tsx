"use client";

import React, { useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { BureauDropdown } from "@/components/BureauDropdown"; // adjust path

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

type Emplacement = { id: string; nom: string; type: string };

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
  const [bureauQuery, setBureauQuery] = useState("");

  // Must match back-end Role enum values exactly:
  const roleOptions = [
    "ADMINISTRATIF",
    "PROFESSOR",
    "RESPONSABLE SI",
    "TECHNICIEN",
  ];
  const fonctionOptions = ["MANAGER", "TECHNICIAN"];
  const directionOptions = ["IT", "HR", "FINANCE"];

  const [bureaux, setBureaux] = useState<string[]>([]);
  const [loadingBureaux, setLoadingBureaux] = useState(true);

  useEffect(() => {
    fetch("http://localhost:2000/emplacements/bureaux", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((bureauxList: Emplacement[]) => {
        setBureaux(bureauxList.map((e) => e.nom));
      })
      .catch(console.error)
      .finally(() => setLoadingBureaux(false));
  }, []);

  // group & sort bureaux by first letter, numeric-aware
  const grouped = bureaux
    .slice()
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .reduce((acc: Record<string, string[]>, name) => {
      const L = name[0].toUpperCase();
      if (!acc[L]) acc[L] = [];
      acc[L].push(name);
      return acc;
    }, {});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
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
        credentials: "include", // ← include cookie
        body: JSON.stringify(formData),
      });

      if (res.status === 409) {
        const err = await res.json();
        throw new Error(err.message || "Email déjà utilisé");
      }
      if (!res.ok) {
        let msg = "Erreur serveur";
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const j = await res.json();
          msg = j.message || msg;
        }
        throw new Error(msg);
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
      <div className="min-h-screen bg-gradient-to-tr from-gray-50 to-gray-100 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-16">
          {/* Hero */}
          <div className="text-center">
            <h1 className="text-5xl font-extrabold text-gray-900">
              Ajouter un Nouvel Utilisateur
            </h1>
          </div>

          {/* Feedback */}
          {error ? (
            <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          ) : success ? (
            <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-700">
                Utilisateur créé avec succès !
              </p>
            </div>
          ) : null}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="divide-y divide-gray-200 overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* Section: Identité */}
            <div className="bg-white px-8 py-10 sm:px-10">
              <h2 className="mb-6 text-2xl font-semibold text-gray-800">
                Informations personnelles
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="relative">
                  <input
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    className="peer h-12 w-full border-b-2 border-gray-300 bg-transparent text-gray-900 placeholder-transparent focus:border-blue-500 focus:outline-none"
                    placeholder="Nom"
                  />
                  <label
                    htmlFor="nom"
                    className="absolute -top-3.5 left-0 text-sm text-gray-600 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-sm"
                  >
                    Nom *
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    required
                    className="peer h-12 w-full border-b-2 border-gray-300 bg-transparent text-gray-900 placeholder-transparent focus:border-blue-500 focus:outline-none"
                    placeholder="Prénom"
                  />
                  <label
                    htmlFor="prenom"
                    className="absolute -top-3.5 left-0 text-sm text-gray-600 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-sm"
                  >
                    Prénom *
                  </label>
                </div>
                <div className="relative sm:col-span-2">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="peer h-12 w-full border-b-2 border-gray-300 bg-transparent text-gray-900 placeholder-transparent focus:border-blue-500 focus:outline-none"
                    placeholder="Email"
                  />
                  <label
                    htmlFor="email"
                    className="absolute -top-3.5 left-0 text-sm text-gray-600 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-sm"
                  >
                    Email *
                  </label>
                </div>
                <div className="relative sm:col-span-2">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="peer h-12 w-full border-b-2 border-gray-300 bg-transparent text-gray-900 placeholder-transparent focus:border-blue-500 focus:outline-none"
                    placeholder="Mot de passe"
                  />
                  <label
                    htmlFor="password"
                    className="absolute -top-3.5 left-0 text-sm text-gray-600 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-sm"
                  >
                    Mot de passe *
                  </label>
                </div>
              </div>
            </div>

            {/* Section: Rôle & Organisation */}
            <div className="bg-gray-50 px-8 py-10 sm:px-10">
              <h2 className="mb-6 text-2xl font-semibold text-gray-800">
                Rôle & Organisation
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="roles"
                    className="block text-sm font-medium text-gray-600"
                  >
                    Rôle *
                  </label>
                  <select
                    id="roles"
                    name="roles"
                    value={formData.roles}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 transition focus:border-indigo-500 focus:ring-indigo-200"
                  >
                    <option value="">Sélectionnez un rôle</option>
                    {roleOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="fonction"
                    className="block text-sm font-medium text-gray-600"
                  >
                    Fonction *
                  </label>
                  <select
                    id="fonction"
                    name="fonction"
                    value={formData.fonction}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 transition focus:border-indigo-500 focus:ring-indigo-200"
                  >
                    <option value="">Sélectionnez une fonction</option>
                    {fonctionOptions.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="direction"
                    className="block text-sm font-medium text-gray-600"
                  >
                    Direction *
                  </label>
                  <select
                    id="direction"
                    name="direction"
                    value={formData.direction}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 transition focus:border-indigo-500 focus:ring-indigo-200"
                  >
                    <option value="">Sélectionnez une direction</option>
                    {directionOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="bureauNom"
                    className="block text-sm font-medium text-gray-600"
                  >
                    Bureau (optionnel)
                  </label>
                  <BureauDropdown
                    options={bureaux}
                    value={formData.bureauNom}
                    onChange={(v) =>
                      setFormData((f) => ({ ...f, bureauNom: v }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="bg-white px-8 py-6 text-right sm:px-10">
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:opacity-90"
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
