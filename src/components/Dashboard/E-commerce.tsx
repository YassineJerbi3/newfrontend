"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type RepartType = Record<string, number>;

const COLORS = [
  "#4F46E5",
  "#10B981",
  "#EF4444",
  "#F59E0B",
  "#3B82F6",
  "#8B5CF6",
];

// Base URL absolue pour ton backend sur le port 2000
const API_BASE = "http://localhost:2000";

const DashboardEquipements: React.FC = () => {
  // Statistiques équipements existantes
  const [total, setTotal] = useState<number>(0);
  const [etat, setEtat] = useState<{ fonctionnel: number; enPanne: number }>({
    fonctionnel: 0,
    enPanne: 0,
  });
  const [ageMoyen, setAgeMoyen] = useState<number>(0);
  const [nonPlanifiees, setNonPlanifiees] = useState<number>(0);
  const [enRetard, setEnRetard] = useState<number>(0);
  const [parType, setParType] = useState<RepartType>({});
  const [parMaint, setParMaint] = useState<RepartType>({});
  const [parEmplacement, setParEmplacement] = useState<RepartType>({});

  // Nouvelles statistiques incident ce mois
  const [incidentsDeclared, setIncidentsDeclared] = useState<number>(0);
  const [incidentsResolved, setIncidentsResolved] = useState<number>(0);
  const [incidentsUnresolved, setIncidentsUnresolved] = useState<number>(0);

  useEffect(() => {
    // Calculer l'année et le mois courant
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // Janvier = 0

    // Anciennes stats équipements
    fetch(`${API_BASE}/equipements/stats/total`)
      .then((res) => res.json())
      .then(setTotal);

    fetch(`${API_BASE}/equipements/stats/etat`)
      .then((res) => res.json())
      .then(setEtat);

    fetch(`${API_BASE}/equipements/stats/age-moyen`)
      .then((res) => res.json())
      .then(setAgeMoyen);

    fetch(`${API_BASE}/equipements/stats/non-planifiees`)
      .then((res) => res.json())
      .then(setNonPlanifiees);

    fetch(`${API_BASE}/equipements/stats/en-retard`)
      .then((res) => res.json())
      .then(setEnRetard);

    fetch(`${API_BASE}/equipements/stats/par-type`)
      .then((res) => res.json())
      .then(setParType);

    fetch(`${API_BASE}/equipements/stats/maintenance-type`)
      .then((res) => res.json())
      .then(setParMaint);

    // Nouvelles stats incidents
    fetch(`${API_BASE}/incidents/stats/declare?year=${year}&month=${month}`)
      .then((res) => res.json())
      .then((data) => setIncidentsDeclared(data.declared));

    fetch(`${API_BASE}/incidents/stats/resolved?year=${year}&month=${month}`)
      .then((res) => res.json())
      .then((data) => setIncidentsResolved(data.resolved));

    fetch(`${API_BASE}/incidents/stats/unresolved?year=${year}&month=${month}`)
      .then((res) => res.json())
      .then((data) => setIncidentsUnresolved(data.unresolved));
    fetch(`${API_BASE}/equipements/stats/par-emplacement`)
      .then((res) => res.json())
      .then(setParEmplacement);
  }, []);
  const dataParEmplacement = Object.entries(parEmplacement).map(
    ([name, count]) => ({
      name,
      count,
    }),
  );

  // Préparation des données pour les graphiques
  const dataParType = Object.entries(parType).map(([name, count]) => ({
    name,
    count,
  }));
  const dataParMaint = Object.entries(parMaint).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Tableau de bord équipements & incidents (mois courant)
      </h1>

      {/* KPI Cards Equipements */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-5 shadow">
          <h2 className="text-lg font-medium text-gray-600">
            Total équipements
          </h2>
          <p className="mt-2 text-3xl font-bold">{total}</p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow">
          <h2 className="text-lg font-medium text-gray-600">
            Fonctionnels / En panne
          </h2>
          <p className="mt-2">
            {etat.fonctionnel} / {etat.enPanne}
          </p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow">
          <h2 className="text-lg font-medium text-gray-600">
            Âge moyen (jours)
          </h2>
          <p className="mt-2 text-3xl font-bold">{ageMoyen}</p>
        </div>
      </div>

      {/* KPI Cards Incidents ce mois */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-5 shadow">
          <h2 className="text-lg font-medium text-gray-600">
            Incidents déclarés ce mois
          </h2>
          <p className="mt-2 text-3xl font-bold">{incidentsDeclared}</p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow">
          <h2 className="text-lg font-medium text-gray-600">
            Incidents résolus ce mois
          </h2>
          <p className="mt-2 text-3xl font-bold">{incidentsResolved}</p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow">
          <h2 className="text-lg font-medium text-gray-600">
            Incidents non résolus ce mois
          </h2>
          <p className="mt-2 text-3xl font-bold">{incidentsUnresolved}</p>
        </div>
      </div>

      {/* Graphiques Equipements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-5 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-600">
            Répartition par type d’équipement
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataParType}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count">
                {dataParType.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-lg bg-white p-5 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-600">
            Répartition par type d’emplacement
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataParEmplacement}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count">
                {dataParEmplacement.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg bg-white p-5 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-600">
            Répartition par type de maintenance
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataParMaint}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {dataParMaint.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardEquipements;
