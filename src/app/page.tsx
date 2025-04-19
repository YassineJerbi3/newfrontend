// app/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("PROFESSOR");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation basique
    if (!name.trim()) {
      alert("Veuillez saisir votre nom");
      return;
    }

    // On normalise le rôle pour l’URL
    const slug = role.toLowerCase().replace(/\s+/g, "");

    // On stocke l’utilisateur
    localStorage.setItem("user", JSON.stringify({ name, role }));

    // ET on redirige
    router.push("acceuil");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-80 rounded bg-white p-8 shadow-md"
      >
        <h2 className="mb-6 text-center text-2xl font-bold">Login</h2>

        <div className="mb-4">
          <label htmlFor="name" className="mb-1 block">
            Nom
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="Votre nom"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="role" className="mb-1 block">
            Rôle
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded border px-3 py-2"
          >
            <option value="PROFESSOR">PROFESSOR</option>
            <option value="ADMINISTRATIF">ADMINISTRATIF</option>
            <option value="RESPONSABLE SI">RESPONSABLE SI</option>
            <option value="TECHNICIEN">TECHNICIEN</option>
          </select>
        </div>

        <button
          type="submit" // ← bien garder type="submit"
          className="w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}
