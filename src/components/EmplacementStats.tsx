"use client";

import React, { useEffect, useState } from "react";
import { FaTools, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { StatsByEmplacementDto } from "@/types"; // définis ce type dans src/types.ts ou équivalent

interface EmplacementStatsProps {
  emplacementId: string;
  className?: string; // optionnel pour styliser le wrapper
}

export default function EmplacementStats({
  emplacementId,
  className,
}: EmplacementStatsProps) {
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";

  const [stats, setStats] = useState<StatsByEmplacementDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!emplacementId) return;
    setLoading(true);
    setError(null);

    fetch(`${API}/equipements/stats/par-emplacement/${emplacementId}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then((data: StatsByEmplacementDto) => setStats(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [emplacementId]);

  if (loading) return <p>Chargement des statistiques…</p>;
  if (error) return <p className="text-red-600">Erreur : {error}</p>;
  if (!stats) return null;

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-4">
          <FaTools size={24} className="text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">Total équipements</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-4">
          <FaCheckCircle size={24} className="text-green-600" />
          <div>
            <p className="text-sm text-gray-600">Fonctionnels</p>
            <p className="text-2xl font-bold">{stats.fonctionnel}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-4">
          <FaTimesCircle size={24} className="text-red-600" />
          <div>
            <p className="text-sm text-gray-600">En panne</p>
            <p className="text-2xl font-bold">{stats.enPanne}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
