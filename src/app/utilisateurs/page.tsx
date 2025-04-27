"use client";

import React, { useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  fonction: string;
  direction: string;
  roles: string;
}

export default function UsersListPage() {
  // 1️⃣ Data and loading state
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // 2️⃣ Filters for each column
  const [filters, setFilters] = useState({
    nom: "",
    prenom: "",
    email: "",
    fonction: "",
    direction: "",
    roles: "",
  });

  // 3️⃣ Edit‐modal state
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editedUserData, setEditedUserData] = useState<Partial<User>>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch users on mount
  useEffect(() => {
    fetch("http://localhost:2000/users", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized or server error");
        return res.json();
      })
      .then((data: User[]) => setUsers(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Handler for filter inputs/selects
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Apply all six filters
  const filteredUsers = users.filter((u) => {
    return (
      u.nom.toLowerCase().includes(filters.nom.toLowerCase()) &&
      u.prenom.toLowerCase().includes(filters.prenom.toLowerCase()) &&
      u.email.toLowerCase().includes(filters.email.toLowerCase()) &&
      u.fonction.toLowerCase().includes(filters.fonction.toLowerCase()) &&
      u.direction.toLowerCase().includes(filters.direction.toLowerCase()) &&
      u.roles.toLowerCase().includes(filters.roles.toLowerCase())
    );
  });

  // Open edit modal
  const openEditModal = (user: User) => {
    setEditUser(user);
    setEditedUserData({ ...user });
    setShowEditModal(true);
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditUser(null);
    setEditedUserData({});
  };

  // Track edits
  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setEditedUserData({
      ...editedUserData,
      [e.target.name]: e.target.value,
    });
  };

  // On save click: validate then show confirm
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editedUserData.nom ||
      !editedUserData.prenom ||
      !editedUserData.email ||
      !editedUserData.fonction ||
      !editedUserData.direction ||
      !editedUserData.roles
    ) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setShowConfirmModal(true);
  };

  // Confirm and call backend
  const confirmUpdate = async () => {
    if (!editedUserData.id) return;
    try {
      // Only send allowed fields
      const body = {
        nom: editedUserData.nom,
        prenom: editedUserData.prenom,
        email: editedUserData.email,
        fonction: editedUserData.fonction,
        direction: editedUserData.direction,
        roles: editedUserData.roles,
      };
      const res = await fetch(
        `http://localhost:2000/users/${editedUserData.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) throw new Error("Update failed");
      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editedUserData.id ? ({ ...u, ...body } as User) : u,
        ),
      );
      setShowConfirmModal(false);
      closeEditModal();
    } catch (err: any) {
      alert("Erreur lors de la mise à jour : " + err.message);
    }
  };

  if (loading) return <DefaultLayout>Chargement…</DefaultLayout>;

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold">Liste des Utilisateurs</h1>

        {/* ── Filters per column ── */}
        <div className="mb-4 grid grid-cols-6 gap-4">
          <input
            name="nom"
            value={filters.nom}
            onChange={handleFilterChange}
            placeholder="Filtrer par Nom"
            className="rounded border p-2"
          />
          <input
            name="prenom"
            value={filters.prenom}
            onChange={handleFilterChange}
            placeholder="Filtrer par Prénom"
            className="rounded border p-2"
          />
          <input
            name="email"
            value={filters.email}
            onChange={handleFilterChange}
            placeholder="Filtrer par Email"
            className="rounded border p-2"
          />
          <select
            name="fonction"
            value={filters.fonction}
            onChange={handleFilterChange}
            className="rounded border p-2"
          >
            <option value="">Toutes Fonctions</option>
            <option value="MANAGER">Manager</option>
            <option value="TECHNICIAN">Technician</option>
          </select>
          <select
            name="direction"
            value={filters.direction}
            onChange={handleFilterChange}
            className="rounded border p-2"
          >
            <option value="">Toutes Directions</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="FINANCE">Finance</option>
          </select>
          <select
            name="roles"
            value={filters.roles}
            onChange={handleFilterChange}
            className="rounded border p-2"
          >
            <option value="">Tous les Rôles</option>
            <option value="ADMINISTRATIF">Administratif</option>
            <option value="PROFESSOR">Professor</option>
            <option value="RESPONSABLE SI">Responsable SI</option>
            <option value="TECHNICIEN">Technicien</option>
          </select>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full border-collapse text-left">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Prénom</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Fonction</th>
                <th className="px-4 py-2">Direction</th>
                <th className="px-4 py-2">Rôle</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className="border-b odd:bg-white even:bg-gray-50"
                >
                  <td className="px-4 py-2">{u.nom}</td>
                  <td className="px-4 py-2">{u.prenom}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.fonction}</td>
                  <td className="px-4 py-2">{u.direction}</td>
                  <td className="px-4 py-2">{u.roles}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => openEditModal(u)}
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
                    colSpan={7}
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Edit Modal ── */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-lg rounded bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold">Modifier l’utilisateur</h2>
              <form onSubmit={handleSave} className="space-y-4">
                {/* inputs for each editable field */}
                {(
                  [
                    "nom",
                    "prenom",
                    "email",
                    "fonction",
                    "direction",
                    "roles",
                  ] as (keyof User)[]
                ).map((field) => (
                  <div key={field}>
                    <label className="block font-semibold">
                      {field.charAt(0).toUpperCase() + field.slice(1)} *
                    </label>
                    {field === "fonction" ||
                    field === "direction" ||
                    field === "roles" ? (
                      <select
                        name={field}
                        value={(editedUserData as any)[field] || ""}
                        onChange={handleEditChange}
                        className="w-full rounded border p-2"
                        required
                      >
                        <option value="">Sélectionnez</option>
                        {field === "fonction" && (
                          <>
                            <option value="MANAGER">Manager</option>
                            <option value="TECHNICIAN">Technician</option>
                          </>
                        )}
                        {field === "direction" && (
                          <>
                            <option value="IT">IT</option>
                            <option value="HR">HR</option>
                            <option value="FINANCE">Finance</option>
                          </>
                        )}
                        {field === "roles" && (
                          <>
                            <option value="ADMINISTRATIF">Administratif</option>
                            <option value="PROFESSOR">Professor</option>
                            <option value="RESPONSABLE SI">
                              Responsable SI
                            </option>
                            <option value="TECHNICIEN">Technicien</option>
                          </>
                        )}
                      </select>
                    ) : (
                      <input
                        type={field === "email" ? "email" : "text"}
                        name={field}
                        value={(editedUserData as any)[field] || ""}
                        onChange={handleEditChange}
                        className="w-full rounded border p-2"
                        required
                      />
                    )}
                  </div>
                ))}

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

        {/* ── Confirmation Modal ── */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-sm rounded bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold">
                Êtes-vous sûr de vouloir appliquer ces modifications ?
              </h2>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
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
