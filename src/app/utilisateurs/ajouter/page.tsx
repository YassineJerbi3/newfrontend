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

  const roleOptions = ["ADMIN", "PROFESSOR", "RESPONSABLE SI", "TECHNICIAN"];
  const fonctionOptions = ["MANAGER", "TECHNICIAN"];
  const directionOptions = ["IT", "HR", "FINANCE"];

  const [bureaux, setBureaux] = useState<string[]>([]);
  const [loadingBureaux, setLoadingBureaux] = useState(true);

  useEffect(() => {
    fetch("http://localhost:2000/emplacements")
      .then((res) => res.json())
      .then((list: { nom: string; type: string }[]) => {
        const names = list.filter((e) => e.type === "BUREAU").map((e) => e.nom);
        setBureaux(names);
      })
      .catch(console.error)
      .finally(() => setLoadingBureaux(false));
  }, []);

  // group and sort bureaux
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
      <div className="mx-auto max-w-xl rounded bg-white p-6 shadow-lg">
        <h1 className="mb-4 text-xl font-bold">
          Ajouter un Nouvel Utilisateur
        </h1>
        {error && <p className="mb-4 text-red-600">{error}</p>}
        {success && <p className="mb-4 text-green-600">Utilisateur créé !</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom */}
          <div>
            <label htmlFor="nom" className="block font-semibold">
              Nom *
            </label>
            <input
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="w-full rounded border p-2"
              required
            />
          </div>

          {/* Prénom */}
          <div>
            <label htmlFor="prenom" className="block font-semibold">
              Prénom *
            </label>
            <input
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              className="w-full rounded border p-2"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block font-semibold">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded border p-2"
              required
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label htmlFor="password" className="block font-semibold">
              Mot de passe *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded border p-2"
              required
            />
          </div>

          {/* Rôle */}
          <div>
            <label htmlFor="roles" className="block font-semibold">
              Rôle *
            </label>
            <select
              id="roles"
              name="roles"
              value={formData.roles}
              onChange={handleChange}
              className="w-full rounded border p-2"
              required
            >
              <option value="">Sélectionnez un rôle</option>
              {roleOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Fonction */}
          <div>
            <label htmlFor="fonction" className="block font-semibold">
              Fonction *
            </label>
            <select
              id="fonction"
              name="fonction"
              value={formData.fonction}
              onChange={handleChange}
              className="w-full rounded border p-2"
              required
            >
              <option value="">Sélectionnez une fonction</option>
              {fonctionOptions.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Direction */}
          <div>
            <label htmlFor="direction" className="block font-semibold">
              Direction *
            </label>
            <select
              id="direction"
              name="direction"
              value={formData.direction}
              onChange={handleChange}
              className="w-full rounded border p-2"
              required
            >
              <option value="">Sélectionnez une direction</option>
              {directionOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Bureau (optionnel, 5 visible, grouped) */}
          <div>
            <label htmlFor="bureauNom" className="block font-semibold">
              Bureau (optionnel)
            </label>
            <BureauDropdown
              options={bureaux}
              value={formData.bureauNom}
              onChange={(v) => setFormData((f) => ({ ...f, bureauNom: v }))}
            />
            <p className="mt-1 text-sm text-gray-500">
              Cliquez pour dérouler et scrollez pour voir tous les bureaux.
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
          >
            Ajouter
          </button>
        </form>
      </div>
    </DefaultLayout>
  );
}
