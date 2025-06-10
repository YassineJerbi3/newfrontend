// src/app/classes-edit/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {
  FaChalkboardTeacher,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

interface Emplacement {
  id: string;
  nom: string;
  type: string;
}

export default function ClasseSelectionPage() {
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";
  const [classes, setClasses] = useState<Emplacement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Erreurs de suppression par ID
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});

  // Pour l'édition
  const [editing, setEditing] = useState<Emplacement | null>(null);
  const [newName, setNewName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  // Charge la liste des classes
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/emplacements/classes`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: Emplacement[] = await res.json();
      setClasses(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Supprime un emplacement
  const handleDelete = async (id: string) => {
    // reset erreur précédente
    setDeleteErrors((prev) => ({ ...prev, [id]: "" }));
    try {
      const res = await fetch(`${API}/emplacements/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        const msg = j.message || `Erreur ${res.status}`;
        setDeleteErrors((prev) => ({ ...prev, [id]: msg }));
      } else {
        setClasses((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err: any) {
      setDeleteErrors((prev) => ({ ...prev, [id]: err.message }));
    }
  };

  // Ouvre le modal d'édition
  const openEdit = (cls: Emplacement) => {
    setEditing(cls);
    setNewName(cls.nom);
    setEditError(null);
  };
  const closeEdit = () => {
    setEditing(null);
    setNewName("");
    setEditError(null);
  };

  // Sauvegarde le nouveau nom
  const handleSaveEdit = async () => {
    if (!editing) return;
    setEditError(null);
    if (!newName.trim()) {
      setEditError("Le nom ne peut pas être vide");
      return;
    }
    try {
      const res = await fetch(`${API}/emplacements/${editing.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: newName }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setEditError(j.message || `Erreur ${res.status}`);
      } else {
        setClasses((prev) =>
          prev.map((c) => (c.id === editing.id ? { ...c, nom: newName } : c)),
        );
        closeEdit();
      }
    } catch (err: any) {
      setEditError(err.message);
    }
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white px-4 py-10">
        <h1 className="mb-6 text-center text-4xl font-extrabold text-indigo-800">
          Sélectionner une classe
        </h1>

        {loading && (
          <p className="text-center text-lg text-gray-500">Chargement…</p>
        )}
        {error && (
          <p className="text-center text-lg text-red-600">Erreur : {error}</p>
        )}

        <div className="grid w-full max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {!loading && !error && classes.length === 0 && (
            <p className="col-span-full text-center text-lg text-gray-600">
              Aucune classe disponible.
            </p>
          )}

          {classes.map((cls) => (
            <div
              key={cls.id}
              className="relative flex flex-col items-center rounded-3xl border border-gray-200 bg-white p-8 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-indigo-500 hover:shadow-2xl"
            >
              {/* Bouton Modifier */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openEdit(cls);
                }}
                className="absolute right-12 top-4 rounded-full bg-white p-2 text-indigo-600 hover:bg-gray-100"
              >
                <FaEdit />
              </button>

              {/* Bouton Supprimer */}

              {/* Lien vers détails (clic sur le corps) */}
              <Link
                href={`/classes-edit/${cls.id}`}
                className="flex flex-col items-center"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 transition-colors duration-300 group-hover:bg-indigo-600">
                  <FaChalkboardTeacher
                    size={30}
                    className="text-indigo-600 group-hover:text-white"
                  />
                </div>
                <h2 className="text-center text-2xl font-semibold text-gray-800 group-hover:text-indigo-700">
                  {cls.nom}
                </h2>
              </Link>

              {/* Message d'erreur de suppression */}
              {deleteErrors[cls.id] && (
                <p className="mt-4 text-sm text-red-600">
                  {deleteErrors[cls.id]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Modal d’édition */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md space-y-6 rounded bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Modifier le nom</h3>
                <button onClick={closeEdit}>
                  <FaTimes className="text-gray-600 hover:text-gray-800" />
                </button>
              </div>

              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded border px-3 py-2"
              />

              {/* Erreur inline */}
              {editError && <p className="text-sm text-red-600">{editError}</p>}

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={closeEdit}
                  className="rounded px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  <FaCheck /> Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
