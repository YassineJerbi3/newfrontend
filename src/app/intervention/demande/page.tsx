// src/app/intervention/demande/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { AlertTriangle } from "lucide-react";

interface Emplacement {
  id: string;
  nom: string;
}
interface Equipement {
  id: string;
  familleMI: string;
  equipmentType: string;
  numeroSerie: string;
  etat: string;
  userId?: string | null;
  posteId?: string | null;
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
  const [formData, setFormData] = useState({
    // Identité (rempli auto)
    nom: "",
    prenom: "",
    fonction: "",
    direction: "",
    // Ancien contexte
    emplacementOrigineId: "",
    typeObject: "",
    equipementId: "",
    etatAvant: "",
    ancienUserId: "",
    ancienPosteId: "",
    // Destination & nouvelle affectation
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

  const [users, setUsers] = useState<User[]>([]);
  const [postes, setPostes] = useState<Poste[]>([]);

  const motifs = [
    { value: DeplacementMotif.REAFFECTION, label: "Réaffectation" },
    { value: DeplacementMotif.REMPLACEMENT, label: "Remplacement" },
    { value: DeplacementMotif.REPARATION, label: "Réparation" },
  ];

  // 1) Charger l’utilisateur courant
  useEffect(() => {
    fetch("http://localhost:2000/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((u: any) =>
        setFormData((f) => ({
          ...f,
          nom: u.nom,
          prenom: u.prenom,
          fonction: u.fonction,
          direction: u.direction,
        })),
      )
      .catch(console.error);
  }, []);

  // 2) Charger les emplacements
  useEffect(() => {
    fetch("http://localhost:2000/emplacements", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { items: Emplacement[] }) => setEmplacements(data.items))
      .catch((err) => {
        console.error("Erreur fetch emplacements:", err);
        setEmplacements([]);
      });
  }, []);

  // 3) Charger tous les users pour réaffectation
  useEffect(() => {
    fetch("http://localhost:2000/users", { credentials: "include" })
      .then((r) => r.json())
      .then((data: User[]) => setUsers(data))
      .catch(console.error);
  }, []);

  // 4) Charger équipements d’origine
  useEffect(() => {
    if (!formData.emplacementOrigineId) {
      setAllEquipements([]);
      setTypes([]);
      setFilteredEquipements([]);
      setSelectedEquipement(null);
      setFormData((f) => ({
        ...f,
        typeObject: "",
        equipementId: "",
        etatAvant: "",
        ancienUserId: "",
        ancienPosteId: "",
      }));
      return;
    }
    fetch(
      `http://localhost:2000/equipements?emplacementId=${formData.emplacementOrigineId}`,
      { credentials: "include" },
    )
      .then((r) => r.json())
      .then((data: Equipement[]) => {
        setAllEquipements(data);
        setTypes(Array.from(new Set(data.map((eq) => eq.equipmentType))));
        setFilteredEquipements([]);
        setSelectedEquipement(null);
        setFormData((f) => ({
          ...f,
          typeObject: "",
          equipementId: "",
          etatAvant: "",
          ancienUserId: "",
          ancienPosteId: "",
        }));
      })
      .catch(console.error);
  }, [formData.emplacementOrigineId]);

  // 5) Filtrer par type d’équipement
  useEffect(() => {
    if (!formData.typeObject) {
      setFilteredEquipements([]);
      setSelectedEquipement(null);
      setFormData((f) => ({
        ...f,
        equipementId: "",
        etatAvant: "",
        ancienUserId: "",
        ancienPosteId: "",
      }));
      return;
    }
    const filtered = allEquipements.filter(
      (eq) => eq.equipmentType === formData.typeObject,
    );
    setFilteredEquipements(filtered);
    setSelectedEquipement(null);
    setFormData((f) => ({
      ...f,
      equipementId: "",
      etatAvant: "",
      ancienUserId: "",
      ancienPosteId: "",
    }));
  }, [formData.typeObject, allEquipements]);

  // 6) Gérer changement de champ
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === "equipementId") {
      const eq = filteredEquipements.find((e) => e.id === value) || null;
      setSelectedEquipement(eq);
      setFormData((f) => ({
        ...f,
        equipementId: value,
        etatAvant: eq?.etat ?? "",
        ancienUserId: eq?.userId ?? "",
        ancienPosteId: eq?.posteId ?? "",
      }));
      return;
    }
    setFormData((f) => ({ ...f, [name]: value }));
  };

  // 7) Charger postes du nouvel emplacement si écran/UC
  useEffect(() => {
    if (
      formData.destinationEmplacementId &&
      ["ECRAN", "UC"].includes(formData.typeObject)
    ) {
      fetch(
        `http://localhost:2000/postes?emplacementId=${formData.destinationEmplacementId}`,
        { credentials: "include" },
      )
        .then((r) => r.json())
        .then((data: Poste[]) => setPostes(data))
        .catch(console.error);
    } else {
      setPostes([]);
      setFormData((f) => ({ ...f, newPosteId: "" }));
    }
  }, [formData.destinationEmplacementId, formData.typeObject]);

  // 8) Soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const payload = {
      technicienId: "", // à récupérer depuis le contexte/auth
      equipementId: formData.equipementId,
      ancienEmplacementId: formData.emplacementOrigineId,
      etatAvant: formData.etatAvant,
      destinationEmplacementId: formData.destinationEmplacementId,
      motif: formData.motif,
      posteId: formData.ancienPosteId || undefined,
      newPosteId: formData.newPosteId || undefined,
      newUserId: formData.newUserId || undefined,
      newUtilisateur: formData.newUtilisateur || undefined,
      commentaire: formData.commentaire || undefined,
    };

    fetch("http://localhost:2000/deplacements", {
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
          // reset sauf identification
          setFormData((f) => ({
            nom: f.nom,
            prenom: f.prenom,
            fonction: f.fonction,
            direction: f.direction,
            emplacementOrigineId: "",
            typeObject: "",
            equipementId: "",
            etatAvant: "",
            ancienUserId: "",
            ancienPosteId: "",
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
      .catch(() => setSubmitError("Erreur réseau, réessayez plus tard"));
  };

  return (
    <DefaultLayout>
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-6xl space-y-10 p-8"
      >
        {/* Header */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-center shadow-2xl">
          <h1 className="text-6xl font-extrabold tracking-wide text-white">
            Demande de Déplacement
          </h1>
        </div>

        {/* 1. IDENTITÉ */}
        <div className="relative rounded-2xl bg-white p-8 shadow-2xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {["nom", "prenom", "fonction", "direction"].map((field) => (
              <div key={field} className="flex flex-col">
                <label className="mb-2 text-sm font-medium uppercase text-gray-700">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type="text"
                  name={field}
                  value={(formData as any)[field]}
                  readOnly
                  className="rounded-lg border border-gray-300 bg-gray-50 px-5 py-3"
                />
              </div>
            ))}
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
                {Array.isArray(emplacements) &&
                  emplacements.map((e) => (
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
                    value={formData.ancienUserId || "Aucun"}
                    className="rounded-lg border border-gray-300 bg-gray-50 px-5 py-3"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Ancien poste</label>
                  <input
                    readOnly
                    value={formData.ancienPosteId || "Aucun"}
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
                {Array.isArray(emplacements) &&
                  emplacements.map((e) => (
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

            <div className="flex flex-col">
              <label>Nouvel utilisateur (optionnel)</label>
              <select
                name="newUserId"
                value={formData.newUserId}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 bg-white px-5 py-3"
              >
                <option value="">— Aucun —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nom} {u.prenom}
                  </option>
                ))}
              </select>
            </div>

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
