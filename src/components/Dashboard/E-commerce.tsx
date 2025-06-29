// src/components/Dashboard/DashboardEquipements.tsx

"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
  "#6366F1", // indigo-500
  "#10B981", // emerald-500
  "#EF4444", // red-500
  "#F59E0B", // amber-500
  "#3B82F6", // blue-500
  "#8B5CF6", // violet-500
];

const API_BASE = "http://localhost:2000";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, type: "spring", stiffness: 50 },
  }),
};

const DashboardEquipements: React.FC = () => {
  // 1) Role-based rendering
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  // 2) Dashboard stats states
  const [total, setTotal] = useState(0);
  const [etat, setEtat] = useState({ fonctionnel: 0, enPanne: 0 });
  const [ageMoyen, setAgeMoyen] = useState(0);
  const [nonPlanifiees, setNonPlanifiees] = useState(0);
  const [enRetard, setEnRetard] = useState(0);
  const [parType, setParType] = useState<RepartType>({});
  const [parMaint, setParMaint] = useState<RepartType>({});
  const [parEmplacement, setParEmplacement] = useState<RepartType>({});

  const [incidentsDeclared, setIncidentsDeclared] = useState(0);
  const [incidentsResolved, setIncidentsResolved] = useState(0);
  const [incidentsUnresolved, setIncidentsUnresolved] = useState(0);

  const [totalUsers, setTotalUsers] = useState(0);
  const [usersByRole, setUsersByRole] = useState<RepartType>({});

  // Fetch the logged-in user's role
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((res) => res.json())
      .then((user) => setUserRole(user.roles))
      .catch(() => setUserRole(null))
      .finally(() => setLoadingRole(false));
  }, []);

  // Only if Responsable SI, load stats
  useEffect(() => {
    if (userRole !== "RESPONSABLE SI") return;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Equipement stats
    fetch(`${API_BASE}/equipements/stats/total`, { credentials: "include" })
      .then((r) => r.json())
      .then(setTotal);
    fetch(`${API_BASE}/equipements/stats/etat`, { credentials: "include" })
      .then((r) => r.json())
      .then(setEtat);
    fetch(`${API_BASE}/equipements/stats/age-moyen`, { credentials: "include" })
      .then((r) => r.json())
      .then(setAgeMoyen);
    fetch(`${API_BASE}/equipements/stats/non-planifiees`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(setNonPlanifiees);
    fetch(`${API_BASE}/equipements/stats/en-retard`, { credentials: "include" })
      .then((r) => r.json())
      .then(setEnRetard);
    fetch(`${API_BASE}/equipements/stats/par-type`, { credentials: "include" })
      .then((r) => r.json())
      .then(setParType);
    fetch(`${API_BASE}/equipements/stats/maintenance-type`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(setParMaint);
    fetch(`${API_BASE}/equipements/stats/par-emplacement`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(setParEmplacement);

    // Incident stats
    fetch(`${API_BASE}/incidents/stats/declare?year=${year}&month=${month}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => setIncidentsDeclared(d.declared));
    fetch(`${API_BASE}/incidents/stats/resolved?year=${year}&month=${month}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => setIncidentsResolved(d.resolved));
    fetch(
      `${API_BASE}/incidents/stats/unresolved?year=${year}&month=${month}`,
      { credentials: "include" },
    )
      .then((r) => r.json())
      .then((d) => setIncidentsUnresolved(d.unresolved));

    // User stats
    fetch(`${API_BASE}/users/stats/total`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setTotalUsers(d.total));
    fetch(`${API_BASE}/users/stats/by-role`, { credentials: "include" })
      .then((r) => r.json())
      .then(setUsersByRole);
  }, [userRole]);

  // Prepare data for charts
  const dataParType = Object.entries(parType).map(([name, count]) => ({
    name,
    count,
  }));
  const dataParMaint = Object.entries(parMaint).map(([name, value]) => ({
    name,
    value,
  }));
  const dataParEmplacement = Object.entries(parEmplacement).map(
    ([name, count]) => ({ name, count }),
  );
  const dataUsersByRole = Object.entries(usersByRole).map(([name, value]) => ({
    name,
    value,
  }));

  // Loading state
  if (loadingRole) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Chargement du rôle…</p>
      </div>
    );
  }

  // Non‑Responsable SI view
  if (userRole !== "RESPONSABLE SI") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl bg-white/80 p-8 text-center shadow-xl backdrop-blur-md"
        >
          <h1 className="mb-4 text-3xl font-extrabold">Bienvenue sur ESCS</h1>
          <p className="text-gray-600">
            Bonjour{" "}
            <span className="font-semibold">{userRole || "Utilisateur"}</span>,
            <br />
            Vous n'avez pas accès au tableau de bord complet.
          </p>
        </motion.div>
      </div>
    );
  }

  // Responsable SI full dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-4xl font-extrabold text-transparent"
      >
        Tableau de bord & Statistiques
      </motion.h1>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Total équipements", value: total },
          {
            title: "Fonctionnels / En panne",
            value: `${etat.fonctionnel} / ${etat.enPanne}`,
          },
          { title: "Âge moyen (jours)", value: ageMoyen },
          { title: "Non planifiées", value: nonPlanifiees },
          { title: "En retard", value: enRetard },
          { title: "Incidents déclarés", value: incidentsDeclared },
          { title: "Incidents résolus", value: incidentsResolved },
          { title: "Incidents non résolus", value: incidentsUnresolved },
          { title: "Total utilisateurs", value: totalUsers },
        ].map((card, i) => (
          <motion.div
            key={i}
            custom={i}
            initial="hidden"
            animate="show"
            variants={cardVariants}
            whileHover={{ scale: 1.03 }}
            className="relative rounded-2xl bg-white/80 p-6 shadow-xl backdrop-blur-md transition-shadow hover:shadow-2xl"
          >
            <h2 className="text-sm font-semibold uppercase text-gray-500">
              {card.title}
            </h2>
            <p className="mt-4 text-3xl font-bold text-gray-800">
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {/* Répartition par type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white/80 p-6 shadow-xl backdrop-blur-md"
        >
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
        </motion.div>

        {/* Répartition par emplacement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white/80 p-6 shadow-xl backdrop-blur-md"
        >
          <h2 className="mb-4 text-lg font-medium text-gray-600">
            Répartition par emplacement
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
        </motion.div>

        {/* Répartition par type de maintenance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-white/80 p-6 shadow-xl backdrop-blur-md"
        >
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
        </motion.div>

        {/* Répartition par rôle (utilisateurs) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-white/80 p-6 shadow-xl backdrop-blur-md"
        >
          <h2 className="mb-4 text-lg font-medium text-gray-600">
            Répartition par rôle (utilisateurs)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataUsersByRole}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {dataUsersByRole.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardEquipements;
