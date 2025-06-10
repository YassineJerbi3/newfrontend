// src/app/utilisateurs/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useAuth } from "@/hooks/AuthProvider";
import {
  Briefcase,
  Building2,
  CheckCircle,
  FileText,
  Mail,
  MapPin,
  ShieldCheck,
  Tag,
  User,
  UserCog,
  XCircle,
} from "lucide-react";

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
  active: boolean; // ← ajoute ça
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
  const handleDeactivate = async () => {
    if (!editUser) return;
    if (!confirm("Désactiver ce compte ?")) return;

    const res = await fetch(`http://localhost:2000/users/${editUser.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: false }),
    });
    if (!res.ok) return alert("Échec de la désactivation");

    // Met à jour la liste en front
    setUsers((us) =>
      us.map((u) => (u.id === editUser.id ? { ...u, active: false } : u)),
    );
    closeModal();
  };
  const handleActivate = async () => {
    if (!editUser) return;
    if (!confirm("Réactiver ce compte ?")) return;

    const res = await fetch(`http://localhost:2000/users/${editUser.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: true }),
    });
    if (!res.ok) return alert("Échec de la réactivation");

    setUsers((us) =>
      us.map((u) => (u.id === editUser.id ? { ...u, active: true } : u)),
    );
    closeModal();
  };

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
    fetch("http://localhost:2000/emplacements/bureaux", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Impossible de charger les bureaux");
        return res.json();
      })
      .then((bureaux: Emplacement[]) => {
        setEmplacements(bureaux);
      })
      .catch((err) => {
        console.error(err);
        // tu peux afficher une alerte ou un message d’erreur ici
      });
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
        <h1 className="mb-6 text-center text-3xl font-extrabold text-blue-600">
          Liste des Utilisateurs
        </h1>

        <div className="relative overflow-x-auto rounded-2xl bg-white shadow-2xl">
          {/* Scroll interne */}
          <div className="scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent max-h-[70vh] overflow-y-auto">
            <table className="min-w-full table-auto border-separate [border-spacing:0]">
              <thead>
                {/* En-tête sticky en dégradé bleu */}
                <tr className="sticky top-0 z-20 bg-gradient-to-r from-blue-700 to-blue-500 text-white">
                  {[
                    "Nom",
                    "Prénom",
                    "Email",
                    "Fonction",
                    "Direction",
                    "Rôle",
                    "Bureau",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-xs font-semibold uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
                {/* Filtres glassmorphism sticky */}
                <tr className="sticky top-[48px] z-10 bg-white/60 backdrop-blur-sm">
                  {[
                    { key: "nom" },
                    { key: "prenom" },
                    { key: "email" },
                    { key: "fonction" },
                    { key: "direction" },
                    { key: "roles" },
                    { key: "bureauNom" },
                  ].map(({ key }) => (
                    <th key={key} className="px-4 py-2">
                      <input
                        name={key}
                        value={(filters as any)[key]}
                        onChange={handleFilterChange}
                        placeholder="Filtrer…"
                        className="
                  w-full rounded-lg border border-blue-200 bg-white/80 px-3
                  py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400
                "
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {sorted.map((u, idx) => {
                  const isMe = u.id === currentUser?.id;
                  return (
                    <tr
                      key={u.id}
                      onClick={() => openModal(u)}
                      className={`
                ${idx % 2 === 0 ? "bg-white" : "bg-blue-50"}
                cursor-pointer transition-colors hover:!bg-blue-100
              `}
                    >
                      <td className="flex items-center gap-2 px-6 py-4 text-sm text-gray-800">
                        {isMe && (
                          <span className="inline-block rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                            Moi
                          </span>
                        )}
                        {u.active === false && (
                          <span className="inline-block rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                            Inactive
                          </span>
                        )}
                        {u.nom}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {u.prenom}
                      </td>
                      <td className="break-all px-6 py-4 text-sm text-gray-800">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {u.fonction}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {u.direction}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {u.roles}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {u.bureauNom ?? "—"}
                      </td>
                    </tr>
                  );
                })}
                {sorted.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
                animation: scaleIn 0.25s ease-out forwards;
              }
            `}</style>

            {/* Overlay */}
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />

            {/* Modal container */}
            <div className="fixed inset-x-0 bottom-0 top-[90px] z-50 flex items-center justify-center p-4">
              <div className="animate-scaleIn w-full max-w-xl rounded-3xl bg-white shadow-2xl ring-1 ring-gray-200">
                {/* Header */}
                <header className="flex items-center justify-between rounded-t-3xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">
                    Modifier l’utilisateur
                  </h2>
                  <button
                    onClick={closeModal}
                    aria-label="Fermer"
                    className="text-white hover:opacity-80 focus:outline-none"
                  >
                    <XCircle size={24} />
                  </button>
                </header>

                {/* Body */}
                <div className="space-y-6 p-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Read-only info */}
                    <div className="space-y-4 border-r pr-6">
                      <h3 className="text-lg font-bold text-gray-700">
                        Infos utilisateur
                      </h3>
                      {[
                        { label: "Nom", value: editUser.nom, Icon: User },
                        { label: "Prénom", value: editUser.prenom, Icon: User },
                        { label: "Email", value: editUser.email, Icon: Mail },
                      ].map(({ label, value, Icon }) => (
                        <div key={label} className="flex flex-col">
                          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-600">
                            <Icon size={18} className="text-gray-500" />
                            <span>{label}</span>
                          </div>
                          <input
                            readOnly
                            value={value}
                            className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm text-gray-700"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Editable form */}
                    <form onSubmit={handleSave} className="space-y-4 pl-4">
                      {[
                        {
                          label: "Fonction",
                          name: "fonction",
                          value: edited.fonction,
                          Icon: UserCog,
                          options: ["Manager", "Technicien", "Professeur"],
                        },
                        {
                          label: "Direction",
                          name: "direction",
                          value: edited.direction,
                          Icon: MapPin,
                          options: ["IT", "HR", "Finance"],
                        },
                        {
                          label: "Rôle",
                          name: "roles",
                          value: edited.roles,
                          Icon: ShieldCheck,
                          options: [
                            "Administratif",
                            "Professor",
                            "Responsable SI",
                            "Technicien",
                          ],
                        },
                      ].map(({ label, name, value, Icon, options }) => (
                        <div key={name} className="flex flex-col">
                          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-600">
                            <Icon size={18} className="text-gray-500" />
                            <span>{label}</span>
                          </div>
                          <select
                            name={name}
                            value={value || ""}
                            onChange={(e) =>
                              setEdited({ ...edited, [name]: e.target.value })
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                          >
                            <option value="">
                              Sélectionner {label.toLowerCase()}
                            </option>
                            {options.map((opt) => (
                              <option key={opt} value={opt.toUpperCase()}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}

                      {/* BureauField */}
                      <div className="flex flex-col">
                        <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-600">
                          <Building2 size={18} className="text-gray-500" />
                          <span>Bureau</span>
                        </div>
                        <BureauField
                          emplacements={emplacements}
                          edited={edited}
                          setEdited={setEdited}
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-4 pt-6">
                        {/* Si c’est pas le compte courant */}
                        {editUser.id !== currentUser?.id &&
                          (editUser.active ? (
                            <button
                              type="button"
                              onClick={handleDeactivate}
                              className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                              Désactiver
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleActivate}
                              className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700"
                            >
                              Activer
                            </button>
                          ))}
                        <button
                          type="submit"
                          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
