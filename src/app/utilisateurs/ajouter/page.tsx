"use client";

import React, { useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

interface NewUserForm {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: string;
  numeroBureaux?: string;
}

export default function AddUserPage() {
  // État du formulaire
  const [formData, setFormData] = useState<NewUserForm>({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    role: "",
    numeroBureaux: "",
  });

  // Gérer le changement de valeur d'un champ
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Vérifier si les champs obligatoires sont remplis
    if (
      !formData.nom ||
      !formData.prenom ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    // Ici, vous pouvez envoyer les données à votre API ou backend
    console.log("Nouveau Utilisateur:", formData);

    // Réinitialiser le formulaire (facultatif)
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      password: "",
      role: "",
      numeroBureaux: "",
    });
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-xl rounded bg-white p-6 shadow-lg">
        <h1 className="mb-4 text-xl font-bold">
          Ajouter un Nouvel Utilisateur
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom (obligatoire) */}
          <div>
            <label htmlFor="nom" className="block font-semibold">
              Nom *
            </label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="w-full rounded border p-2"
              placeholder="Entrez le nom"
              required
            />
          </div>

          {/* Prénom (obligatoire) */}
          <div>
            <label htmlFor="prenom" className="block font-semibold">
              Prénom *
            </label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              className="w-full rounded border p-2"
              placeholder="Entrez le prénom"
              required
            />
          </div>

          {/* Email (obligatoire) */}
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

          {/* Mot de passe (obligatoire) */}
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

          {/* Rôle (liste déroulante) */}
          <div>
            <label htmlFor="role" className="block font-semibold">
              Rôle *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded border p-2"
              required
            >
              <option value="">Sélectionnez un rôle</option>
              <option value="Technicien">Technicien</option>
              <option value="Professor">Professor</option>
              <option value="Administratif">Administratif</option>
            </select>
          </div>

          {/* Numéro de bureaux (optionnel) */}
          <div>
            <label htmlFor="numeroBureaux" className="block font-semibold">
              Numéro de Bureau (optionnel)
            </label>
            <input
              type="text"
              id="numeroBureaux"
              name="numeroBureaux"
              value={formData.numeroBureaux}
              onChange={handleChange}
              className="w-full rounded border p-2"
              placeholder="Exemple : B-12"
            />
          </div>

          {/* Bouton de soumission */}
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
