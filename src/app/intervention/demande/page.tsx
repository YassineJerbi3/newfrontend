// src/app/intervention/demande/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { AlertTriangle } from "lucide-react";

interface Emplacement {
  id: string;
  nom: string;
  type: string;
}
interface User {
  id: string;
  nom: string;
  prenom: string;
}
interface Poste {
  id: string;
  numero: number | null;
  label: string | null;
}
// Maintenant on attend user/poste dans Equipement
interface Equipement {
  id: string;
  familleMI: string;
  equipmentType: string;
  numeroSerie: string;
  etat: string;
  user?: User | null;
  utilisateur?: string | null;
  poste?: Poste | null;
}

enum DeplacementMotif {
  REAFFECTION = "REAFFECTION",
  REMPLACEMENT = "REMPLACEMENT",
  REPARATION = "REPARATION",
}

enum UtilisateurType {
  ENSEIGNANT = "ENSEIGNANT",
  ETUDIANT = "ETUDIANT",
}

export default function DemandePage() {
  const API = "http://localhost:2000";

  const [formData, setFormData] = useState({
    technicienId: "",
    nom: "",
    prenom: "",
    fonction: "",
    role: "",
    direction: "",
    emplacementOrigineId: "",
    typeObject: "",
    equipementId: "",
    etatAvant: "",
    ancienUser: "", // renommé
    ancienPoste: "", // renommé
    destinationEmplacementId: "",
    motif: "" as DeplacementMotif | "",
    newUserId: "",
    newUtilisateur: "" as UtilisateurType | "",
    newPosteId: "",
    commentaire: "",
  });
  const [submitError, setSubmitError] = useState<string>("");

  const [emplacements, setEmplacements] = useState<Emplacement[]>([]);
  const [allEquipements, setAllEquipements] = useState<Equipement[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [filteredEquipements, setFilteredEquipements] = useState<Equipement[]>(
    [],
  );
  const [selectedEquipement, setSelectedEquipement] =
    useState<Equipement | null>(null);

  const [destUsers, setDestUsers] = useState<User[]>([]);
  const [postes, setPostes] = useState<Poste[]>([]);

  const motifs = [
    { value: DeplacementMotif.REAFFECTION, label: "Réaffectation" },
    { value: DeplacementMotif.REMPLACEMENT, label: "Remplacement" },
    { value: DeplacementMotif.REPARATION, label: "Réparation" },
  ];

  // 1) Identité
  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((u: any) =>
        setFormData((f) => ({
          ...f,
          technicienId: u.id,
          nom: u.nom,
          prenom: u.prenom,
          fonction: u.fonction,
          direction: u.direction,
          role: u.roles,
        })),
      )
      .catch(console.error);
  }, []);

  // 2) Emplacements
  useEffect(() => {
    fetch(`${API}/emplacements`, { credentials: "include" })
      .then((r) => r.json())
      .then((d: { items: Emplacement[] }) => setEmplacements(d.items))
      .catch(console.error);
  }, []);

  // 3) Equipements origine
  useEffect(() => {
    if (!formData.emplacementOrigineId) {
      resetEquipement();
      return;
    }
    fetch(`${API}/equipements?emplacementId=${formData.emplacementOrigineId}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((list: Equipement[]) => {
        setAllEquipements(list);
        setTypes([...new Set(list.map((eq) => eq.equipmentType))]);
        resetEquipement();
      })
      .catch(console.error);
  }, [formData.emplacementOrigineId]);

  function resetEquipement() {
    setFilteredEquipements([]);
    setSelectedEquipement(null);
    setFormData((f) => ({
      ...f,
      typeObject: "",
      equipementId: "",
      etatAvant: "",
      ancienUser: "",
      ancienPoste: "",
    }));
  }

  // 4) Filtrer par type
  useEffect(() => {
    if (!formData.typeObject) {
      resetEquipement();
      return;
    }
    const filt = allEquipements.filter(
      (eq) => eq.equipmentType === formData.typeObject,
    );
    setFilteredEquipements(filt);
    setFormData((f) => ({
      ...f,
      equipementId: "",
      etatAvant: "",
      ancienUser: "",
      ancienPoste: "",
    }));
    setSelectedEquipement(null);
  }, [formData.typeObject, allEquipements]);

  // 5) handleChange
  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    if (name === "equipementId") {
      const eq = filteredEquipements.find((x) => x.id === value) || null;
      let ancienUser = "Aucun";
      if (eq) {
        if (eq.user) ancienUser = `${eq.user.nom} ${eq.user.prenom}`;
        else if (eq.utilisateur) ancienUser = eq.utilisateur;
      }
      let ancienPoste = "Aucun";
      if (eq && eq.poste) {
        ancienPoste =
          eq.poste.numero !== null
            ? `Poste ${eq.poste.numero}`
            : eq.poste.label || "Poste Enseignant";
      }
      setSelectedEquipement(eq);
      setFormData((f) => ({
        ...f,
        equipementId: value,
        etatAvant: eq?.etat ?? "",
        ancienUser,
        ancienPoste,
      }));
      return;
    }
    setFormData((f) => ({ ...f, [name]: value }));
  };

  // 6) Fetch destUsers si bureau
  useEffect(() => {
    const destId = formData.destinationEmplacementId;
    const emp = emplacements.find((e) => e.id === destId);
    if (emp?.type === "BUREAU") {
      fetch(`${API}/users?emplacementId=${destId}`, { credentials: "include" })
        .then((r) => r.json())
        .then((list: User[]) => setDestUsers(list))
        .catch(console.error);
    } else {
      setDestUsers([]);
    }
  }, [formData.destinationEmplacementId, emplacements]);

  // 7) Postes dispo
  useEffect(() => {
    const { destinationEmplacementId, typeObject, newUtilisateur } = formData;
    if (!destinationEmplacementId || !["ECRAN", "UC"].includes(typeObject)) {
      setPostes([]);
      return;
    }
    fetch(`${API}/postes?emplacementId=${destinationEmplacementId}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((list: Poste[]) => {
        const dispo = list.filter((p) => {
          // exclure déjà équipés même type
          const used = allEquipements.find(
            (eq) => eq.poste?.id === p.id && eq.equipmentType === typeObject,
          );
          if (used) return false;
          // filtre classe
          if (newUtilisateur === UtilisateurType.ENSEIGNANT)
            return p.numero === null;
          if (newUtilisateur === UtilisateurType.ETUDIANT)
            return p.numero !== null;
          return true;
        });
        setPostes(dispo);
      })
      .catch(console.error);
  }, [
    formData.destinationEmplacementId,
    formData.typeObject,
    formData.newUtilisateur,
    allEquipements,
  ]);

  // 8) submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    const payload = {
      technicienId: formData.technicienId,
      equipementId: formData.equipementId,
      etatAvant: formData.etatAvant,
      nouvelleEmplacement: formData.destinationEmplacementId,
      motif: formData.motif,
      nouvelUtilisateur: formData.newUserId || undefined,
      typeUtilisateur: formData.newUtilisateur || undefined,
      nouveauPoste: formData.newPosteId || undefined,
      commentaire: formData.commentaire || undefined,
    };
    fetch(`${API}/deplacements`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          setSubmitError(err.message || "Erreur inconnue");
        } else {
          setFormData((f) => ({
            ...f,
            emplacementOrigineId: "",
            typeObject: "",
            equipementId: "",
            etatAvant: "",
            ancienUser: "",
            ancienPoste: "",
            destinationEmplacementId: "",
            motif: "",
            newUserId: "",
            newUtilisateur: "",
            newPosteId: "",
            commentaire: "",
          }));
          setFilteredEquipements([]);
          setSelectedEquipement(null);
        }
      })
      .catch(() => setSubmitError("Erreur réseau"));
  };

  return (
    <DefaultLayout>
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-6xl space-y-10 p-8"
      >
        {/* Header & 1. IDENTITÉ inchangés */}
        {/* Header */}{" "}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-center shadow-2xl">
          {" "}
          <h1 className="text-6xl font-extrabold tracking-wide text-white">
            {" "}
            Demande de Déplacement{" "}
          </h1>{" "}
        </div>
        {/* 1. IDENTITÉ TECHNICIEN */}
        <div className="relative rounded-2xl bg-white p-8 shadow-2xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="flex flex-col">
              <label>Nom</label>
              <input
                readOnly
                value={formData.nom}
                className="rounded-lg border bg-gray-50 px-5 py-3"
              />
            </div>
            <div className="flex flex-col">
              <label>Prénom</label>
              <input
                readOnly
                value={formData.prenom}
                className="rounded-lg border bg-gray-50 px-5 py-3"
              />
            </div>
            <div className="flex flex-col">
              <label>Direction</label>
              <input
                readOnly
                value={formData.direction}
                className="rounded-lg border bg-gray-50 px-5 py-3"
              />
            </div>
            <div className="flex flex-col">
              <label>Rôle</label>
              <input
                readOnly
                value={formData.role}
                className="rounded-lg border bg-gray-50 px-5 py-3"
              />
            </div>
          </div>
        </div>
        {/* 2. ANCIENNES INFORMATIONS SUR LE MATÉRIEL */}
        <div className="relative rounded-2xl bg-white p-8 shadow-2xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col">
              <label>Emplacement origine</label>
              <select
                name="emplacementOrigineId"
                value={formData.emplacementOrigineId}
                onChange={handleChange}
                required
                className="rounded-lg border border-gray-300 bg-white px-5 py-3"
              >
                <option value="">— Choisir —</option>
                {emplacements.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label>Type</label>
              <select
                name="typeObject"
                value={formData.typeObject}
                onChange={handleChange}
                required
                disabled={!types.length}
                className="rounded-lg border border-gray-300 bg-white px-5 py-3"
              >
                <option value="">— Choisir —</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label>Famille MI</label>
              <select
                name="equipementId"
                value={formData.equipementId}
                onChange={handleChange}
                required
                disabled={!formData.typeObject}
                className="rounded-lg border border-gray-300 bg-white px-5 py-3"
              >
                <option value="">— Choisir —</option>
                {filteredEquipements.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.familleMI}
                  </option>
                ))}
              </select>
            </div>

            {selectedEquipement && (
              <>
                <div className="flex flex-col">
                  <label>N° de série</label>
                  <input
                    readOnly
                    value={selectedEquipement.numeroSerie}
                    className="rounded-lg border border-gray-300 bg-gray-50 px-5 py-3"
                  />
                </div>
                <div className="flex flex-col">
                  <label>État avant</label>
                  <input
                    readOnly
                    value={selectedEquipement.etat}
                    className="rounded-lg border border-gray-300 bg-gray-50 px-5 py-3"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Ancien utilisateur</label>
                  <input
                    readOnly
                    value={formData.ancienUser || "Aucun"}
                    className="rounded-lg border border-gray-300 bg-gray-50 px-5 py-3"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Ancien poste</label>
                  <input
                    readOnly
                    value={formData.ancienPoste || "Aucun"}
                    className="rounded-lg border border-gray-300 bg-gray-50 px-5 py-3"
                  />
                </div>
              </>
            )}
          </div>
        </div>
        {/* 3. DESTINATION & NOUVELLES AFFECTATIONS */}
        <div className="relative rounded-2xl bg-white p-8 shadow-2xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col">
              <label>Destination</label>
              <select
                name="destinationEmplacementId"
                value={formData.destinationEmplacementId}
                onChange={handleChange}
                required
                className="rounded-lg border border-gray-300 bg-white px-5 py-3"
              >
                <option value="">— Choisir —</option>
                {emplacements.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label>Motif</label>
              <div className="flex flex-wrap gap-6">
                {motifs.map((m) => (
                  <label
                    key={m.value}
                    className="inline-flex items-center space-x-3"
                  >
                    <input
                      type="radio"
                      name="motif"
                      value={m.value}
                      checked={formData.motif === m.value}
                      onChange={handleChange}
                      required
                    />
                    <span>{m.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {emplacements.find(
              (e) => e.id === formData.destinationEmplacementId,
            )?.type === "BUREAU" ? (
              <div className="flex flex-col">
                <label>Nouvel utilisateur (optionnel)</label>
                <select
                  name="newUserId"
                  value={formData.newUserId}
                  onChange={handleChange}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-3"
                >
                  <option value="">— Aucun —</option>
                  {destUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nom} {u.prenom}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex flex-col">
                <label>Pool utilisateur (optionnel)</label>
                <select
                  name="newUtilisateur"
                  value={formData.newUtilisateur}
                  onChange={handleChange}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-3"
                >
                  <option value="">— Aucun —</option>
                  <option value={UtilisateurType.ENSEIGNANT}>ENSEIGNANT</option>
                  <option value={UtilisateurType.ETUDIANT}>ÉTUDIANT</option>
                </select>
              </div>
            )}

            {["ECRAN", "UC"].includes(formData.typeObject) && (
              <div className="flex flex-col">
                <label>Nouvelle affectation poste (optionnel)</label>
                <select
                  name="newPosteId"
                  value={formData.newPosteId}
                  onChange={handleChange}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-3"
                >
                  <option value="">— Aucun —</option>
                  {postes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.numero !== null ? `Poste ${p.numero}` : p.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col md:col-span-2">
              <label>Commentaire (optionnel)</label>
              <textarea
                name="commentaire"
                value={formData.commentaire}
                onChange={handleChange}
                rows={3}
                className="rounded-lg border border-gray-300 bg-white px-5 py-3"
              />
            </div>
          </div>
        </div>
        {/* 4. BOUTON D’ENVOI */}
        <div className="grid grid-cols-1 items-end gap-8 md:grid-cols-2">
          <div />
          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-4 text-xl font-bold text-white shadow-2xl transition hover:scale-105"
          >
            Envoyer ma demande
          </button>
        </div>
        {submitError && (
          <div className="mt-4 flex items-start space-x-2 rounded-lg border border-red-200 bg-red-50 p-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-sm font-medium text-red-800">{submitError}</p>
          </div>
        )}
      </form>
    </DefaultLayout>
  );
}
