"use client";

import React, { useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

interface NewUserForm {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  roles: string; // Role enum
  fonction: string; // Fonction enum
  direction: string; // Direction enum
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
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // ENUM OPTIONS
  const roleOptions = [
    "ADMINISTRATIF",
    "PROFESSOR",
    "RESPONSABLE SI",
    "TECHNICIEN",
  ];
  const fonctionOptions = ["MANAGER", "TECHNICIAN"];
  const directionOptions = ["IT", "HR", "FINANCE"];

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

      // Duplicate email
      if (res.status === 409) {
        const err = await res.json();
        throw new Error(err.message || "Email déjà utilisé");
      }

      const contentType = res.headers.get("content-type");
      if (!res.ok) {
        let errorMsg = "Erreur serveur";
        if (contentType?.includes("application/json")) {
          const errJson = await res.json();
          errorMsg = errJson.message || errorMsg;
        } else {
          const errText = await res.text();
          console.error("Non-JSON error response:", errText);
        }
        throw new Error(errorMsg);
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
              placeholder="Entrez le nom"
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
              placeholder="Entrez le prénom"
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
              placeholder="exemple@domain.com"
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
              placeholder="Entrez un mot de passe"
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
