// src/app/utilisateurs/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useAuth } from "@/hooks/AuthProvider";

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  fonction: string;
  direction: string;
  roles: string;
  emplacementId?: string;
  bureauNom?: string;
}
interface Emplacement {
  id: string;
  nom: string;
  type: string;
}

function BureauField({
  emplacements,
  edited,
  setEdited,
}: {
  emplacements: Emplacement[];
  edited: Partial<User>;
  setEdited: (u: Partial<User>) => void;
}) {
  const [search, setSearch] = useState("");

  // group filtered emplacements by first uppercase letter
  const grouped = useMemo(() => {
    const filtered = emplacements
      .filter((e) => e.nom.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.nom.localeCompare(b.nom));
    return filtered.reduce(
      (acc, e) => {
        const L = e.nom[0].toUpperCase();
        (acc[L] ||= []).push(e);
        return acc;
      },
      {} as Record<string, Emplacement[]>,
    );
  }, [emplacements, search]);

  return (
    <div>
      <label className="block text-sm font-medium">Bureau</label>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher…"
        className="mb-1 w-full rounded border px-2 py-1"
      />
      <div className="relative">
        <select
          size={5}
          className="w-full rounded border p-2"
          value={edited.bureauNom || ""}
          onChange={(e) => {
            const nom = e.target.value;
            if (nom === "") {
              // “— Aucun —” chosen
              setEdited({
                ...edited,
                bureauNom: undefined,
                emplacementId: null,
              });
            } else {
              const emp = emplacements.find((x) => x.nom === nom)!;
              setEdited({ ...edited, bureauNom: nom, emplacementId: emp.id });
            }
          }}
        >
          <option value="">— Aucun —</option>
          {Object.entries(grouped).map(([letter, list]) => (
            <optgroup key={letter} label={letter}>
              {list.map((e) => (
                <option key={e.id} value={e.nom}>
                  {e.nom}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-white" />
      </div>
    </div>
  );
}

export default function UsersListPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    nom: "",
    prenom: "",
    email: "",
    fonction: "",
    direction: "",
    roles: "",
    bureauNom: "",
  });
  const [emplacements, setEmplacements] = useState<Emplacement[]>([]);

  const [editUser, setEditUser] = useState<User | null>(null);
  const [edited, setEdited] = useState<Partial<User>>({});
  const [showEditModal, setShowEditModal] = useState(false);

  // fetch users
  useEffect(() => {
    fetch("http://localhost:2000/users", { credentials: "include" })
      .then((res) => res.json())
      .then((data: any[]) => {
        setUsers(
          data.map((u) => ({
            ...u,
            bureauNom: u.emplacement?.nom,
            emplacementId: u.emplacementId,
          })),
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // fetch emplacements (use data.items!)
  useEffect(() => {
    fetch("http://localhost:2000/emplacements", { credentials: "include" })
      .then((res) => res.json())
      .then((data: { items: Emplacement[] }) => {
        setEmplacements(data.items);
      })
      .catch(console.error);
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<any>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filtered = users.filter(
    (u) =>
      u.nom.toLowerCase().includes(filters.nom.toLowerCase()) &&
      u.prenom.toLowerCase().includes(filters.prenom.toLowerCase()) &&
      u.email.toLowerCase().includes(filters.email.toLowerCase()) &&
      u.fonction.toLowerCase().includes(filters.fonction.toLowerCase()) &&
      u.direction.toLowerCase().includes(filters.direction.toLowerCase()) &&
      u.roles.toLowerCase().includes(filters.roles.toLowerCase()) &&
      (u.bureauNom || "")
        .toLowerCase()
        .includes(filters.bureauNom.toLowerCase()),
  );

  // current user on top
  const sorted = useMemo(() => {
    if (!currentUser) return filtered;
    const me = filtered.find((u) => u.id === currentUser.id);
    const others = filtered.filter((u) => u.id !== currentUser.id);
    return me ? [me, ...others] : others;
  }, [filtered, currentUser]);

  const openModal = (u: User) => {
    setEditUser(u);
    setEdited({ ...u });
    setShowEditModal(true);
  };
  const closeModal = () => setShowEditModal(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    const body: any = {
      fonction: edited.fonction,
      direction: edited.direction,
      roles: edited.roles,
      emplacementId: edited.emplacementId,
    };
    const res = await fetch(`http://localhost:2000/users/${editUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (!res.ok) return alert("Échec de la mise à jour");
    setUsers((us) =>
      us.map((u) =>
        u.id === editUser.id
          ? { ...u, ...body, bureauNom: edited.bureauNom }
          : u,
      ),
    );
    closeModal();
  };

  const handleDelete = async () => {
    if (!editUser) return;
    if (!confirm("Supprimer cet utilisateur ?")) return;
    const res = await fetch(`http://localhost:2000/users/${editUser.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) return alert("Échec de la suppression");
    setUsers((us) => us.filter((u) => u.id !== editUser.id));
    closeModal();
  };

  if (loading) return <DefaultLayout>Chargement…</DefaultLayout>;

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold">Liste des Utilisateurs</h1>

        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "15%" }} />
            </colgroup>
            <thead className="bg-blue-100">
              <tr>
                {[
                  "Nom",
                  "Prénom",
                  "Email",
                  "Fonction",
                  "Direction",
                  "Rôle",
                  "Bureau",
                ].map((h) => (
                  <th key={h} className="px-4 py-2">
                    {h}
                  </th>
                ))}
              </tr>
              <tr className="bg-blue-50">
                {(["nom", "prenom", "email"] as const).map((f) => (
                  <th key={f} className="p-2">
                    <input
                      name={f}
                      value={(filters as any)[f]}
                      onChange={handleFilterChange}
                      placeholder="Filtrer..."
                      className="w-full rounded border p-1"
                    />
                  </th>
                ))}
                {(["fonction", "direction", "roles", "bureauNom"] as const).map(
                  (f) => (
                    <th key={f} className="p-2">
                      <input
                        name={f}
                        value={(filters as any)[f]}
                        onChange={handleFilterChange}
                        placeholder="Filtrer..."
                        className="w-full rounded border p-1"
                      />
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {sorted.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => openModal(u)}
                  className={`cursor-pointer border-b hover:bg-blue-50 ${
                    u.id === currentUser?.id ? "bg-green-50" : ""
                  }`}
                >
                  <td className="px-4 py-2">{u.nom}</td>
                  <td className="px-4 py-2">{u.prenom}</td>
                  <td className="break-all px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.fonction}</td>
                  <td className="px-4 py-2">{u.direction}</td>
                  <td className="px-4 py-2">{u.roles}</td>
                  <td className="px-4 py-2">{u.bureauNom ?? "—"}</td>
                </tr>
              ))}
              {sorted.length === 0 && (
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

        {showEditModal && editUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative flex w-full max-w-2xl rounded bg-white p-6 shadow-lg">
              <button
                onClick={closeModal}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-800"
                aria-label="Close"
              >
                ×
              </button>

              <div className="flex w-full space-x-6">
                <div className="w-1/2 space-y-4 border-r pr-4">
                  <h2 className="text-xl font-bold">Infos utilisateur</h2>
                  <div>
                    <label className="block text-sm font-medium">Nom</label>
                    <input
                      readOnly
                      value={editUser.nom}
                      className="w-full rounded border bg-gray-100 p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Prénom</label>
                    <input
                      readOnly
                      value={editUser.prenom}
                      className="w-full rounded border bg-gray-100 p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                      readOnly
                      value={editUser.email}
                      className="w-full rounded border bg-gray-100 p-2"
                    />
                  </div>
                </div>

                <form onSubmit={handleSave} className="w-1/2 space-y-4 pl-4">
                  <div>
                    <label className="block text-sm font-medium">
                      Fonction
                    </label>
                    <select
                      name="fonction"
                      value={edited.fonction || ""}
                      onChange={(e) =>
                        setEdited({ ...edited, fonction: e.target.value })
                      }
                      className="w-full rounded border p-2"
                    >
                      <option value="">Sélectionner</option>
                      <option value="MANAGER">Manager</option>
                      <option value="TECHNICIAN">Technician</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Direction
                    </label>
                    <select
                      name="direction"
                      value={edited.direction || ""}
                      onChange={(e) =>
                        setEdited({ ...edited, direction: e.target.value })
                      }
                      className="w-full rounded border p-2"
                    >
                      <option value="">Sélectionner</option>
                      <option value="IT">IT</option>
                      <option value="HR">HR</option>
                      <option value="FINANCE">Finance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Rôle</label>
                    <select
                      name="roles"
                      value={edited.roles || ""}
                      onChange={(e) =>
                        setEdited({ ...edited, roles: e.target.value })
                      }
                      className="w-full rounded border p-2"
                    >
                      <option value="">Sélectionner</option>
                      <option value="ADMINISTRATIF">Administratif</option>
                      <option value="PROFESSOR">Professor</option>
                      <option value="RESPONSABLE SI">Responsable SI</option>
                      <option value="TECHNICIEN">Technicien</option>
                    </select>
                  </div>

                  <BureauField
                    emplacements={emplacements}
                    edited={edited}
                    setEdited={setEdited}
                  />

                  <div className="flex justify-between space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex-1 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                      Supprimer
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                      Sauvegarder
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
