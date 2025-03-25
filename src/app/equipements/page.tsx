"use client";

import React, { useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

interface Equipement {
  familleMI: string;
  delegation: string;
  code: string;
  numeroSerie: string;
  codeInventaire: string;
  dateMiseEnService: string;
  emplacement: string;
  utilisateur: string;
  etat: string;
}

export default function TableEquipementsPage() {
  // Données d’exemple (vous pouvez les récupérer depuis une API/BDD)
  const initialData: Equipement[] = [
    {
      familleMI: "Unité Centrale",
      delegation: "UC Acer",
      code: "ucahmed",
      numeroSerie: "SN12345",
      codeInventaire: "Inv-UC-001",
      dateMiseEnService: "2022-05-12",
      emplacement: "Salle 101",
      utilisateur: "Ahmed",
      etat: "Neuf",
    },
    {
      familleMI: "Écran",
      delegation: "Ecran Dell",
      code: "ec-lab1",
      numeroSerie: "SN98765",
      codeInventaire: "Inv-ECR-002",
      dateMiseEnService: "2023-01-10",
      emplacement: "Laboratoire 1",
      utilisateur: "Enseignant Lab1",
      etat: "Occasion",
    },
    {
      familleMI: "Serveur",
      delegation: "Serveur HP",
      code: "srv-bureau1",
      numeroSerie: "SN55555",
      codeInventaire: "Inv-SRV-003",
      dateMiseEnService: "2021-11-05",
      emplacement: "Bureau Informatique",
      utilisateur: "AdminSys",
      etat: "Neuf",
    },
    {
      familleMI: "Datashow",
      delegation: "Projecteur Epson",
      code: "data-amphi1",
      numeroSerie: "SN44444",
      codeInventaire: "Inv-DATA-004",
      dateMiseEnService: "2022-09-01",
      emplacement: "Amphithéâtre 1",
      utilisateur: "Service Audiovisuel",
      etat: "En Panne",
    },
    {
      familleMI: "Photocopieuse",
      delegation: "Canon",
      code: "photo-secretariat",
      numeroSerie: "SN11111",
      codeInventaire: "Inv-PHOTO-005",
      dateMiseEnService: "2020-03-15",
      emplacement: "Secrétariat",
      utilisateur: "Secrétaire",
      etat: "Occasion",
    },
    {
      familleMI: "Caméra de Surveillance",
      delegation: "Caméra Dahua",
      code: "cam-couloir1",
      numeroSerie: "SN22222",
      codeInventaire: "Inv-CAM-006",
      dateMiseEnService: "2023-02-20",
      emplacement: "Couloir Principal",
      utilisateur: "Service Sécurité",
      etat: "Neuf",
    },
  ];

  // État local pour les filtres
  const [filters, setFilters] = useState({
    familleMI: "",
    delegation: "",
    code: "",
    numeroSerie: "",
    codeInventaire: "",
    dateMiseEnService: "",
    emplacement: "",
    utilisateur: "",
    etat: "",
  });

  // Gère la modification d’un champ de filtre
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // Filtrer les données en fonction de tous les champs
  const filteredData = initialData.filter((item) => {
    // Filtre pour familleMI (si non vide et différent, on exclut l’élément)
    if (
      filters.familleMI &&
      item.familleMI.toLowerCase() !== filters.familleMI.toLowerCase()
    ) {
      return false;
    }

    // Filtre pour delegation (on fait un includes pour un champ texte)
    if (
      filters.delegation &&
      !item.delegation.toLowerCase().includes(filters.delegation.toLowerCase())
    ) {
      return false;
    }

    // Filtre pour code
    if (
      filters.code &&
      !item.code.toLowerCase().includes(filters.code.toLowerCase())
    ) {
      return false;
    }

    // Filtre pour numeroSerie
    if (
      filters.numeroSerie &&
      !item.numeroSerie
        .toLowerCase()
        .includes(filters.numeroSerie.toLowerCase())
    ) {
      return false;
    }

    // Filtre pour codeInventaire
    if (
      filters.codeInventaire &&
      !item.codeInventaire
        .toLowerCase()
        .includes(filters.codeInventaire.toLowerCase())
    ) {
      return false;
    }

    // Filtre pour dateMiseEnService (ex: 2022-05-12)
    // Ici on fait un includes, mais vous pouvez faire un filtrage plus élaboré (par intervalle de dates, etc.)
    if (
      filters.dateMiseEnService &&
      !item.dateMiseEnService
        .toLowerCase()
        .includes(filters.dateMiseEnService.toLowerCase())
    ) {
      return false;
    }

    // Filtre pour emplacement
    if (
      filters.emplacement &&
      !item.emplacement
        .toLowerCase()
        .includes(filters.emplacement.toLowerCase())
    ) {
      return false;
    }

    // Filtre pour utilisateur
    if (
      filters.utilisateur &&
      !item.utilisateur
        .toLowerCase()
        .includes(filters.utilisateur.toLowerCase())
    ) {
      return false;
    }

    // Filtre pour état (si non vide et différent, on exclut l’élément)
    if (
      filters.etat &&
      item.etat.toLowerCase() !== filters.etat.toLowerCase()
    ) {
      return false;
    }

    return true;
  });

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold">Liste des Équipements</h1>

        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full border-collapse text-left">
            <thead className="bg-blue-100">
              {/* Ligne des titres */}
              <tr>
                <th className="px-4 py-2">Famille MI</th>
                <th className="px-4 py-2">Délégation</th>
                <th className="px-4 py-2">Code</th>
                <th className="px-4 py-2">N° de Série</th>
                <th className="px-4 py-2">Code Inventaire</th>
                <th className="px-4 py-2">Date de mise en service</th>
                <th className="px-4 py-2">Emplacement</th>
                <th className="px-4 py-2">Utilisateur</th>
                <th className="px-4 py-2">État</th>
              </tr>
              {/* Ligne des filtres */}
              <tr>
                {/* Famille MI (select) */}
                <th className="px-4 py-2">
                  <select
                    name="familleMI"
                    value={filters.familleMI}
                    onChange={handleFilterChange}
                    className="w-full rounded border p-1"
                  >
                    <option value="">Toutes</option>
                    <option value="Unité Centrale">Unité Centrale</option>
                    <option value="Écran">Écran</option>
                    <option value="Écran Interactif">Écran Interactif</option>
                    <option value="Datashow">Datashow</option>
                    <option value="Imprimante">Imprimante</option>
                    <option value="Serveur">Serveur</option>
                    <option value="Caméra de Surveillance">
                      Caméra de Surveillance
                    </option>
                    <option value="Photocopieuse">Photocopieuse</option>
                    <option value="TV">TV</option>
                  </select>
                </th>

                {/* Délégation (texte) */}
                <th className="px-4 py-2">
                  <input
                    type="text"
                    name="delegation"
                    value={filters.delegation}
                    onChange={handleFilterChange}
                    placeholder="Filtrer Délégation"
                    className="w-full rounded border p-1"
                  />
                </th>

                {/* Code (texte) */}
                <th className="px-4 py-2">
                  <input
                    type="text"
                    name="code"
                    value={filters.code}
                    onChange={handleFilterChange}
                    placeholder="Filtrer Code"
                    className="w-full rounded border p-1"
                  />
                </th>

                {/* N° de Série (texte) */}
                <th className="px-4 py-2">
                  <input
                    type="text"
                    name="numeroSerie"
                    value={filters.numeroSerie}
                    onChange={handleFilterChange}
                    placeholder="Filtrer N° Série"
                    className="w-full rounded border p-1"
                  />
                </th>

                {/* Code Inventaire (texte) */}
                <th className="px-4 py-2">
                  <input
                    type="text"
                    name="codeInventaire"
                    value={filters.codeInventaire}
                    onChange={handleFilterChange}
                    placeholder="Filtrer Inventaire"
                    className="w-full rounded border p-1"
                  />
                </th>

                {/* Date mise en service (texte ou date) */}
                <th className="px-4 py-2">
                  <input
                    type="text"
                    name="dateMiseEnService"
                    value={filters.dateMiseEnService}
                    onChange={handleFilterChange}
                    placeholder="aaaa-mm-jj"
                    className="w-full rounded border p-1"
                  />
                </th>

                {/* Emplacement (texte) */}
                <th className="px-4 py-2">
                  <input
                    type="text"
                    name="emplacement"
                    value={filters.emplacement}
                    onChange={handleFilterChange}
                    placeholder="Filtrer Emplacement"
                    className="w-full rounded border p-1"
                  />
                </th>

                {/* Utilisateur (texte) */}
                <th className="px-4 py-2">
                  <input
                    type="text"
                    name="utilisateur"
                    value={filters.utilisateur}
                    onChange={handleFilterChange}
                    placeholder="Filtrer Utilisateur"
                    className="w-full rounded border p-1"
                  />
                </th>

                {/* État (select) */}
                <th className="px-4 py-2">
                  <select
                    name="etat"
                    value={filters.etat}
                    onChange={handleFilterChange}
                    className="w-full rounded border p-1"
                  >
                    <option value="">Tous</option>
                    <option value="Neuf">Neuf</option>
                    <option value="Occasion">Occasion</option>
                    <option value="En Panne">En Panne</option>
                  </select>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((equip, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="px-4 py-2">{equip.familleMI}</td>
                  <td className="px-4 py-2">{equip.delegation}</td>
                  <td className="px-4 py-2">{equip.code}</td>
                  <td className="px-4 py-2">{equip.numeroSerie}</td>
                  <td className="px-4 py-2">{equip.codeInventaire}</td>
                  <td className="px-4 py-2">{equip.dateMiseEnService}</td>
                  <td className="px-4 py-2">{equip.emplacement}</td>
                  <td className="px-4 py-2">{equip.utilisateur}</td>
                  <td className="px-4 py-2">{equip.etat}</td>
                </tr>
              ))}

              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    Aucune donnée trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DefaultLayout>
  );
}
