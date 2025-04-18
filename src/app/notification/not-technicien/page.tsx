"use client";
import React from "react";
import Link from "next/link";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

interface Incident {
  id: number;
  description: string;
  status: "Nouveau" | "En cours" | "Terminé" | "Échec";
}

// Exemple de données simulées pour le technicien
const incidents: Incident[] = [
  { id: 1, description: "Incident sur serveur X", status: "En cours" },
  { id: 2, description: "Incident sur routeur Y", status: "Nouveau" },
  { id: 3, description: "Incident sur imprimante A", status: "Terminé" },
];

const NotificationTechnicien = () => {
  return (
    <DefaultLayout>
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-bold">Notifications - Technicien</h1>
        <ul className="space-y-3">
          {incidents.map((incident) => (
            <li
              key={incident.id}
              className="rounded border p-3 hover:bg-gray-100"
            >
              <Link href="/rapport/incident">
                <div className="block">
                  <div className="font-semibold">Incident</div>
                  <div>{incident.description}</div>
                  <div className="text-sm text-gray-600">
                    Statut : {incident.status}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </DefaultLayout>
  );
};

export default NotificationTechnicien;
