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
          <>
            {/* Animation scaleIn */}
            <style jsx>{`
              @keyframes scaleIn {
                from {
                  opacity: 0;
                  transform: scale(0.95);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }
              .animate-scaleIn {
                animation: scaleIn 0.2s ease-out forwards;
              }
            `}</style>

            {/* Overlay couvrant tout */}
            <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />

            {/* Container de la modale positionné à 90px du haut */}
            <div className="fixed inset-x-0 bottom-0 top-[90px] z-50 flex items-start justify-center p-4">
              <div className="animate-scaleIn max-h-[calc(100vh-90px-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                {/* En-tête */}
                <header className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white">
                    Modifier l’utilisateur
                  </h2>
                  <button
                    onClick={closeModal}
                    aria-label="Fermer"
                    className="text-white hover:opacity-80 focus:outline-none"
                  >
                    ✕
                  </button>
                </header>

                {/* Contenu */}
                <div className="space-y-6 p-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Infos en lecture seule */}
                    <div className="space-y-4 border-r pr-4">
                      <h3 className="text-md font-bold text-gray-700">
                        Infos utilisateur
                      </h3>
                      {(
                        [
                          ["Nom", editUser.nom],
                          ["Prénom", editUser.prenom],
                          ["Email", editUser.email],
                        ] as const
                      ).map(([label, val]) => (
                        <div key={label} className="flex flex-col">
                          <span className="mb-1 text-sm font-medium text-gray-600">
                            {label}
                          </span>
                          <input
                            readOnly
                            value={val}
                            className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Formulaire éditable */}
                    <form onSubmit={handleSave} className="space-y-4 pl-4">
                      {(
                        [
                          ["Fonction", "fonction", edited.fonction],
                          ["Direction", "direction", edited.direction],
                          ["Rôle", "roles", edited.roles],
                        ] as const
                      ).map(([label, name, value]) => (
                        <div key={name} className="flex flex-col">
                          <label className="mb-1 text-sm font-medium text-gray-600">
                            {label}
                          </label>
                          <select
                            name={name}
                            value={value || ""}
                            onChange={(e) =>
                              setEdited({ ...edited, [name]: e.target.value })
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                          >
                            <option value="">Sélectionner</option>
                            {name === "fonction" && (
                              <>
                                <option value="MANAGER">Manager</option>
                                <option value="TECHNICIAN">Technicien</option>
                              </>
                            )}
                            {name === "direction" && (
                              <>
                                <option value="IT">IT</option>
                                <option value="HR">HR</option>
                                <option value="FINANCE">Finance</option>
                              </>
                            )}
                            {name === "roles" && (
                              <>
                                <option value="ADMINISTRATIF">
                                  Administratif
                                </option>
                                <option value="PROFESSOR">Professor</option>
                                <option value="RESPONSABLE SI">
                                  Responsable SI
                                </option>
                                <option value="TECHNICIEN">Technicien</option>
                              </>
                            )}
                          </select>
                        </div>
                      ))}

                      {/* Sélecteur de bureau */}
                      <BureauField
                        emplacements={emplacements}
                        edited={edited}
                        setEdited={setEdited}
                      />

                      {/* Actions */}
                      <div className="flex justify-end gap-4 pt-4">
                        <button
                          type="button"
                          onClick={handleDelete}
                          className="flex-1 rounded-lg bg-red-800 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-900"
                        >
                          Supprimer
                        </button>
                        <button
                          type="submit"
                          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
                        >
                          Sauvegarder
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DefaultLayout>
  );
}
