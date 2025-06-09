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
}

interface User {
  id: string;
  nom: string;
  prenom: string;
  fonction: string;
  direction: string;
}

export default function DemandeInterventionForm() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    fonction: "",
    direction: "",
    emplacementId: "",
    typeObject: "",
    equipementId: "",
    priorite: "",
    etatEquipement: "", // renamed field
    description: "",
    pieceJointe: [] as File[],
    echeance: "",
  });
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );
  const [echeanceError, setEcheanceError] = useState("");
  const [submitError, setSubmitError] = useState<string>("");

  const prioriteOptions = [
    { value: "URGENT", label: "Urgent" },
    { value: "NORMALE", label: "Normale" },
    { value: "BASSE", label: "Basse" },
  ];
  const etatOptions = [
    { value: "EN_MARCHE", label: "En marche" }, // match backend enum
    { value: "ARRET", label: "En arrêt" },
  ];

  const [emplacements, setEmplacements] = useState<Emplacement[]>([]);
  const [allEquipements, setAllEquipements] = useState<Equipement[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);
  const [filteredEquipements, setFilteredEquipements] = useState<Equipement[]>(
    [],
  );
  const [selectedEquipement, setSelectedEquipement] =
    useState<Equipement | null>(null);

  // 1) charger user courant
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

  // 2) charger emplacements
  useEffect(() => {
    fetch("http://localhost:2000/emplacements", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { items: Emplacement[] }) => setEmplacements(data.items))
      .catch(console.error);
  }, []);

  // 3) charger équipements de l’emplacement
  useEffect(() => {
    if (!formData.emplacementId) {
      setAllEquipements([]);
      setEquipmentTypes([]);
      setFormData((f) => ({ ...f, typeObject: "", equipementId: "" }));
      setFilteredEquipements([]);
      setSelectedEquipement(null);
      return;
    }
    fetch(
      `http://localhost:2000/equipements?emplacementId=${formData.emplacementId}`,
      { credentials: "include" },
    )
      .then((r) => r.json())
      .then((data) => {
        const list: Equipement[] = Array.isArray(data) ? data : data.items;
        setAllEquipements(list);
        const types = Array.from(new Set(list.map((eq) => eq.equipmentType)));
        setEquipmentTypes(types);
        setFormData((f) => ({ ...f, typeObject: "", equipementId: "" }));
        setFilteredEquipements([]);
        setSelectedEquipement(null);
      })
      .catch(console.error);
  }, [formData.emplacementId]);

  // 4) filtrer par type
  useEffect(() => {
    if (!formData.typeObject) {
      setFilteredEquipements([]);
      setFormData((f) => ({ ...f, equipementId: "" }));
      setSelectedEquipement(null);
      return;
    }
    const filtered = allEquipements.filter(
      (eq) => eq.equipmentType === formData.typeObject,
    );
    setFilteredEquipements(filtered);
    setFormData((f) => ({ ...f, equipementId: "" }));
    setSelectedEquipement(null);
  }, [formData.typeObject, allEquipements]);

  const simulateUpload = (file: File) => {
    let prog = 0;
    const iv = setInterval(() => {
      prog = Math.min(100, prog + Math.floor(Math.random() * 10) + 5);
      setUploadProgress((p) => ({ ...p, [file.name]: prog }));
      if (prog >= 100) clearInterval(iv);
    }, 300);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, files } = e.target as any;

    if (name === "pieceJointe" && files) {
      const filesArray = Array.from(files) as File[];
      filesArray.forEach(simulateUpload);
      setFormData((f) => ({ ...f, pieceJointe: filesArray }));
      return;
    }

    if (name === "typeObject") {
      const filtered = allEquipements.filter(
        (eq) => eq.equipmentType === value,
      );
      setFormData((f) => ({ ...f, typeObject: value, equipementId: "" }));
      setFilteredEquipements(filtered);
      setSelectedEquipement(null);
      return;
    }

    if (name === "equipementId") {
      const eq = filteredEquipements.find((e) => e.id === value) || null;
      setSelectedEquipement(eq);
    }

    if (name === "echeance") {
      setEcheanceError("");
    }

    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    // validation échéance
    const today = new Date();
    const echeanceDate = new Date(formData.echeance);
    let minDays = 0;
    switch (formData.priorite) {
      case "URGENT":
        minDays = 2;
        break;
      case "NORMALE":
        minDays = 4;
        break;
      case "BASSE":
        minDays = 7;
        break;
    }
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + minDays);

    if (!formData.echeance) {
      setEcheanceError("Ce champ est obligatoire.");
      return;
    }
    if (echeanceDate < minDate) {
      setEcheanceError(
        `La date d’échéance doit être au minimum ${minDays} jour(s) après aujourd’hui pour une priorité “${formData.priorite.toLowerCase()}”.`,
      );
      return;
    }

    // FormData construction
    const payload = new FormData();
    payload.append("equipementId", formData.equipementId);
    payload.append("priorite", formData.priorite);
    payload.append("description", formData.description);
    payload.append("typeObject", formData.typeObject);
    payload.append("etatEquipement", formData.etatEquipement); // send new field
    payload.append("echeance", formData.echeance);
    formData.pieceJointe.forEach((file) => {
      payload.append("pieceJointe", file);
    });

    fetch("http://localhost:2000/incidents", {
      method: "POST",
      credentials: "include",
      body: payload,
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorBody = await res.json();
          setSubmitError(errorBody.message || "Erreur inconnue");
          return;
        }
        // reset
        setSubmitError("");
        setFormData((f) => ({
          nom: f.nom,
          prenom: f.prenom,
          fonction: f.fonction,
          direction: f.direction,
          emplacementId: "",
          typeObject: "",
          equipementId: "",
          priorite: "",
          etatEquipement: "",
          description: "",
          pieceJointe: [],
          echeance: "",
        }));
        setUploadProgress({});
        setSelectedEquipement(null);
        setEcheanceError("");
      })
      .catch((err) => {
        console.error(err);
        setSubmitError("Erreur réseau, réessayez plus tard");
      });
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-6xl p-8">
        {/* Header */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-center shadow-2xl">
          <h1 className="text-6xl font-extrabold tracking-wide text-white">
            Demande d’Intervention
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* IDENTITÉ */}
          <div className="relative rounded-2xl bg-white p-8 shadow-2xl before:absolute before:-top-4 before:left-1/2 before:-translate-x-1/2 before:bg-gradient-to-r before:from-blue-500 before:to-blue-700 before:px-4 before:py-1 before:text-sm before:font-semibold before:text-white before:content-['IDENTITÉ']">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    placeholder={`Votre ${field}`}
                    className="rounded-lg border border-gray-300 bg-gray-50 px-5 py-3 text-gray-800 placeholder-gray-400 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ÉQUIPEMENT */}
          <div className="relative rounded-2xl bg-white p-8 shadow-2xl before:absolute before:-top-4 before:left-1/2 before:-translate-x-1/2 before:bg-gradient-to-r before:from-blue-500 before:to-blue-700 before:px-4 before:py-1 before:text-sm before:font-semibold before:text-white before:content-['ÉQUIPEMENT']">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-medium uppercase text-gray-700">
                  Emplacement
                </label>
                <select
                  name="emplacementId"
                  value={formData.emplacementId}
                  onChange={handleChange}
                  required
                  className="rounded-lg border border-gray-300 bg-white px-5 py-3 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
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
                  disabled={!equipmentTypes.length}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-3 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
                >
                  <option value="">— Choisir —</option>
                  {equipmentTypes.map((t) => (
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
                  disabled={!formData.typeObject}
                  required
                  className="rounded-lg border border-gray-300 bg-white px-5 py-3 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
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
                <div className="col-span-full">
                  <label className="mb-2 text-sm font-medium uppercase text-gray-700">
                    N° de série
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={selectedEquipement.numeroSerie}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-5 py-3 transition focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* PRIORITÉ & ÉTAT */}
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <div className="relative rounded-2xl bg-white p-8 shadow-2xl before:absolute before:-top-4 before:left-10 before:bg-gradient-to-r before:from-blue-500 before:to-blue-700 before:px-3 before:py-1 before:text-xs before:font-semibold before:text-white before:content-['PRIORITÉ']">
              <div className="flex flex-wrap gap-8">
                {prioriteOptions.map(({ value, label }) => (
                  <label
                    key={value}
                    className="inline-flex items-center space-x-3"
                  >
                    <span className="relative flex h-6 w-6 items-center justify-center">
                      <input
                        type="radio"
                        name="priorite"
                        value={value}
                        checked={formData.priorite === value}
                        onChange={handleChange}
                        required
                        className="peer absolute h-full w-full cursor-pointer opacity-0"
                      />
                      <span className="block h-4 w-4 rounded-full border-2 border-blue-500 transition peer-checked:border-transparent peer-checked:bg-blue-500" />
                    </span>
                    <span className="text-gray-800">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="relative rounded-2xl bg-white p-8 shadow-2xl before:absolute before:-top-4 before:left-10 before:bg-gradient-to-r before:from-blue-500 before:to-blue-700 before:px-3 before:py-1 before:text-xs before:font-semibold before:text-white before:content-['ÉTAT']">
              <div className="flex flex-wrap gap-8">
                {etatOptions.map(({ value, label }) => (
                  <label
                    key={value}
                    className="inline-flex items-center space-x-3"
                  >
                    <span className="relative flex h-6 w-6 items-center justify-center">
                      <input
                        type="radio"
                        name="etatEquipement"
                        value={value}
                        checked={formData.etatEquipement === value}
                        onChange={handleChange}
                        required
                        className="peer absolute h-full w-full cursor-pointer opacity-0"
                      />
                      <span className="block h-4 w-4 rounded-full border-2 border-blue-500 transition peer-checked:border-transparent peer-checked:bg-blue-500" />
                    </span>
                    <span className="text-gray-800">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* DESCRIPTION & ATTACHMENTS */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium uppercase text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Expliquez la panne en détail..."
                required
                className="rounded-lg border border-gray-300 bg-gray-50 px-5 py-4 placeholder-gray-400 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium uppercase text-gray-700">
                Pièce jointe
              </label>
              <div className="relative flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition hover:bg-gray-100">
                <input
                  type="file"
                  name="pieceJointe"
                  multiple
                  onChange={handleChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <p className="text-gray-500">
                  Cliquez ou glissez un fichier ici
                </p>
              </div>
              {formData.pieceJointe.length > 0 && (
                <div className="flex justify-between text-sm text-gray-700">
                  <span>{formData.pieceJointe[0].name}</span>
                  <span>
                    {uploadProgress[formData.pieceJointe[0].name] ?? 0}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ÉCHÉANCE & SUBMIT */}
          <div className="grid grid-cols-1 items-end gap-8 md:grid-cols-2">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium uppercase text-gray-700">
                Échéance
              </label>
              <input
                type="date"
                name="echeance"
                value={formData.echeance}
                onChange={handleChange}
                required
                className={`rounded-lg border ${
                  echeanceError ? "border-red-500" : "border-gray-300"
                } bg-gray-50 px-5 py-3 focus:outline-none focus:ring-4 ${
                  echeanceError ? "focus:ring-red-100" : "focus:ring-blue-200"
                } transition`}
              />
              {echeanceError && (
                <p className="text-sm text-red-600">{echeanceError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-4 text-xl font-bold text-white shadow-2xl transition hover:scale-105 focus:ring-4 focus:ring-blue-200"
            >
              Envoyer ma demande
            </button>
          </div>

          {submitError && (
            <div className="mt-4 flex items-start space-x-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-sm font-medium text-red-800">{submitError}</p>
            </div>
          )}
        </form>
      </div>
    </DefaultLayout>
  );
}
