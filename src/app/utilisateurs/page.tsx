"use client";

import React, { useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: string;
  numeroBureaux?: string;
}

export default function UsersListPage() {
  // Données d'exemple
  const initialUsers: User[] = [
    {
      id: 1,
      nom: "Dupont",
      prenom: "Jean",
      email: "jean.dupont@example.com",
      password: "secret",
      role: "Technicien",
      numeroBureaux: "B-101",
    },
    {
      id: 2,
      nom: "Martin",
      prenom: "Claire",
      email: "claire.martin@example.com",
      password: "secret",
      role: "Professor",
      numeroBureaux: "",
    },
    {
      id: 3,
      nom: "Durand",
      prenom: "Paul",
      email: "paul.durand@example.com",
      password: "secret",
      role: "Administratif",
      numeroBureaux: "B-202",
    },
  ];

  // État de la liste et des filtres
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [filters, setFilters] = useState({
    nom: "",
    prenom: "",
    email: "",
    role: "",
  });

  // États pour le modal d'édition et de confirmation
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editedUserData, setEditedUserData] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Gestion des filtres
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredUsers = users.filter((user) => {
    return (
      user.nom.toLowerCase().includes(filters.nom.toLowerCase()) &&
      user.prenom.toLowerCase().includes(filters.prenom.toLowerCase()) &&
      user.email.toLowerCase().includes(filters.email.toLowerCase()) &&
      user.role.toLowerCase().includes(filters.role.toLowerCase())
    );
  });

  // Ouvrir le modal d'édition
  const openEditModal = (user: User) => {
    setEditUser(user);
    setEditedUserData(user);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditUser(null);
    setEditedUserData(null);
  };

  // Gestion des changements dans le formulaire d'édition
  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (!editedUserData) return;
    setEditedUserData({ ...editedUserData, [e.target.name]: e.target.value });
  };

  // Sauvegarder => ouvrir le modal de confirmation
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editedUserData?.nom ||
      !editedUserData?.prenom ||
      !editedUserData?.email ||
      !editedUserData?.password ||
      !editedUserData?.role
    ) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setShowConfirmModal(true);
  };

  // Confirmation de la modification
  const confirmUpdate = () => {
    if (!editedUserData) return;
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === editedUserData.id ? editedUserData : user,
      ),
    );
    setShowConfirmModal(false);
    closeEditModal();
  };

  const cancelUpdate = () => {
    setShowConfirmModal(false);
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold">Liste des Utilisateurs</h1>

        {/* Filtres */}
        <div className="mb-4 grid grid-cols-4 gap-4">
          <input
            type="text"
            name="nom"
            value={filters.nom}
            onChange={handleFilterChange}
            placeholder="Filtrer par Nom"
            className="rounded border p-2"
          />
          <input
            type="text"
            name="prenom"
            value={filters.prenom}
            onChange={handleFilterChange}
            placeholder="Filtrer par Prénom"
            className="rounded border p-2"
          />
          <input
            type="text"
            name="email"
            value={filters.email}
            onChange={handleFilterChange}
            placeholder="Filtrer par Email"
            className="rounded border p-2"
          />
          <select
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            className="rounded border p-2"
          >
            <option value="">Tous les rôles</option>
            <option value="Technicien">Technicien</option>
            <option value="Professor">Professor</option>
            <option value="Administratif">Administratif</option>
          </select>
        </div>

        {/* Tableau des utilisateurs */}
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full border-collapse text-left">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Prénom</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Rôle</th>
                <th className="px-4 py-2">N° de Bureau</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b odd:bg-white even:bg-gray-50"
                >
                  <td className="px-4 py-2">{user.nom}</td>
                  <td className="px-4 py-2">{user.prenom}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.role}</td>
                  <td className="px-4 py-2">{user.numeroBureaux || "-"}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-800"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal d'édition */}
        {showEditModal && editedUserData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md rounded bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold">Modifier lutilisateur</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label htmlFor="nom" className="block font-semibold">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={editedUserData.nom}
                    onChange={handleEditChange}
                    className="w-full rounded border p-2"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="prenom" className="block font-semibold">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={editedUserData.prenom}
                    onChange={handleEditChange}
                    className="w-full rounded border p-2"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block font-semibold">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editedUserData.email}
                    onChange={handleEditChange}
                    className="w-full rounded border p-2"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block font-semibold">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={editedUserData.password}
                    onChange={handleEditChange}
                    className="w-full rounded border p-2"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block font-semibold">
                    Rôle *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={editedUserData.role}
                    onChange={handleEditChange}
                    className="w-full rounded border p-2"
                    required
                  >
                    <option value="">Sélectionnez un rôle</option>
                    <option value="Technicien">Technicien</option>
                    <option value="Professor">Professor</option>
                    <option value="Administratif">Administratif</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="numeroBureaux"
                    className="block font-semibold"
                  >
                    Numéro de Bureau (optionnel)
                  </label>
                  <input
                    type="text"
                    id="numeroBureaux"
                    name="numeroBureaux"
                    value={editedUserData.numeroBureaux || ""}
                    onChange={handleEditChange}
                    className="w-full rounded border p-2"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Sauvegarder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de confirmation */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-sm rounded bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold">
                Êtes-vous sûr de vouloir effectuer cette modification ?
              </h2>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={cancelUpdate}
                  className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmUpdate}
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
