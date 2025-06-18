"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { AlertTriangle } from "lucide-react";
import React, { useState, useEffect } from "react";

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
}
interface User {
  nom: string;
  prenom: string;
  fonction: string;
  direction: string;
}

enum DeplacementMotif {
  REAFFECTION = "REAFFECTION",
  REMPLACEMENT = "REMPLACEMENT",
  REPARATION = "REPARATION",
}

export default function DemandeDeplacementForm() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    fonction: "",
    direction: "",
    emplacementOrigineId: "",
    typeObject: "",
    equipementId: "",
    etatAvant: "",
    destinationEmplacementId: "",
    motif: "" as DeplacementMotif | "",
  });
  const [submitError, setSubmitError] = useState<string>("");

  const motifs = [
    { value: DeplacementMotif.REAFFECTION, label: "Réaffectation" },
    { value: DeplacementMotif.REMPLACEMENT, label: "Remplacement" },
    { value: DeplacementMotif.REPARATION, label: "Réparation" },
  ];
  const [emplacements, setEmplacements] = useState<Emplacement[]>([]);
  const [allEquipements, setAllEquipements] = useState<Equipement[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [filteredEquipements, setFilteredEquipements] = useState<Equipement[]>(
    [],
  );
  const [selectedEquipement, setSelectedEquipement] =
    useState<Equipement | null>(null);

  // 1) Charger l’utilisateur courant
  useEffect(() => {
    fetch("http://localhost:2000/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((u: User) =>
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
      .catch(console.error);
  }, []);

  // 3) Charger équipements d’origine
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
      }));
      return;
    }
    fetch(
      `http://localhost:2000/equipements?emplacementId=${formData.emplacementOrigineId}`,
      { credentials: "include" },
    )
      .then((r) => r.json())
      .then((data) => {
        const list: Equipement[] = Array.isArray(data) ? data : data.items;
        setAllEquipements(list);
        setTypes(Array.from(new Set(list.map((eq) => eq.equipmentType))));
        setFilteredEquipements([]);
        setSelectedEquipement(null);
        setFormData((f) => ({
          ...f,
          typeObject: "",
          equipementId: "",
          etatAvant: "",
        }));
      })
      .catch(console.error);
  }, [formData.emplacementOrigineId]);

  // 4) Filtrer par type
  useEffect(() => {
    if (!formData.typeObject) {
      setFilteredEquipements([]);
      setSelectedEquipement(null);
      setFormData((f) => ({ ...f, equipementId: "", etatAvant: "" }));
      return;
    }
    const filtered = allEquipements.filter(
      (eq) => eq.equipmentType === formData.typeObject,
    );
    setFilteredEquipements(filtered);
    setSelectedEquipement(null);
    setFormData((f) => ({ ...f, equipementId: "", etatAvant: "" }));
  }, [formData.typeObject, allEquipements]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "equipementId") {
      const eq = filteredEquipements.find((e) => e.id === value) || null;
      setSelectedEquipement(eq);
      return setFormData((f) => ({
        ...f,
        equipementId: value,
        etatAvant: eq?.etat ?? "",
      }));
    }
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    const payload = { technicienId: "", ...formData };
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
            destinationEmplacementId: "",
            motif: "",
          }));
          setFilteredEquipements([]);
          setSelectedEquipement(null);
        }
      })
      .catch(() => setSubmitError("Erreur réseau, réessayez plus tard"));
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-6xl space-y-10 p-8">
        {/* Header */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-center shadow-2xl">
          <h1 className="text-6xl font-extrabold tracking-wide text-white">
            Demande de Déplacement
          </h1>
        </div>

        {/* 1. IDENTIFICATION DU DEMANDEUR */}
        <div
          className="relative rounded-2xl bg-white p-8 shadow-2xl
             before:absolute before:-top-4 before:left-1/2 before:-translate-x-1/2
             before:bg-gradient-to-r before:from-blue-500 before:to-blue-700
             before:px-4 before:py-1 before:text-sm before:font-semibold before:text-white
             before:content-['IDENTITÉ']"
        >
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

        {/* 2. INFORMATIONS SUR LE MATÉRIEL */}
        <div
          className="relative rounded-2xl bg-white p-8 shadow-2xl
             before:absolute before:-top-4 before:left-1/2 before:-translate-x-1/2
             before:bg-gradient-to-r before:from-blue-500 before:to-blue-700
             before:px-4 before:py-1 before:text-sm before:font-semibold before:text-white
             before:content-['EQUIPEMENT']"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium uppercase text-gray-700">
                Emplacement origine
              </label>
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
              <label className="mb-2 text-sm font-medium uppercase text-gray-700">
                Type
              </label>
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
              <label className="mb-2 text-sm font-medium uppercase text-gray-700">
                Famille MI
              </label>
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
                  <label className="mb-2 text-sm font-medium uppercase text-gray-700">
                    N° de série
                  </label>
                  <input
                    readOnly
                    value={selectedEquipement.numeroSerie}
                    className="rounded-lg border border-gray-300 bg-gray-50 px-5 py-3"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium uppercase text-gray-700">
                    État avant
                  </label>
                  <input
                    readOnly
                    value={selectedEquipement.etat}
                    className="rounded-lg border border-gray-300 bg-gray-50 px-5 py-3"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* 3. INFORMATIONS SUR LE DÉPLACEMENT */}
        <div
          className="relative rounded-2xl bg-white p-8 shadow-2xl
             before:absolute before:-top-4 before:left-1/2 before:-translate-x-1/2
             before:bg-gradient-to-r before:from-blue-500 before:to-blue-700
             before:px-4 before:py-1 before:text-sm before:font-semibold before:text-white
             before:content-['DESTINATION']"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium uppercase text-gray-700">
                Destination
              </label>
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
              <span className="mb-2 text-sm font-medium uppercase text-gray-700">
                Motif
              </span>
              <div className="flex flex-wrap gap-6">
                {motifs.map((m) => (
                  <label
                    key={m.value}
                    className="inline-flex items-center space-x-3"
                  >
                    <span className="relative flex h-6 w-6 items-center justify-center">
                      <input
                        type="radio"
                        name="motif"
                        value={m.value}
                        checked={formData.motif === m.value}
                        onChange={handleChange}
                        required
                        className="peer absolute h-full w-full cursor-pointer opacity-0"
                      />
                      <span className="block h-4 w-4 rounded-full border-2 border-blue-500 transition peer-checked:border-transparent peer-checked:bg-blue-500" />
                    </span>
                    <span className="text-gray-800">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bouton Envoi */}
        <div className="grid grid-cols-1 items-end gap-8 md:grid-cols-2">
          <div />
          <button
            onClick={handleSubmit}
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
      </div>
    </DefaultLayout>
  );
}
