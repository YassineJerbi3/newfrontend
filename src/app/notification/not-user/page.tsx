"use client";
import React from "react";
import Link from "next/link";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

interface InterventionStatus {
  id: number;
  status: "Prête" | "En cours" | "Échec";
  description: string;
}

// Exemple de données simulées pour utilisateur (professeur/administratif)
const userInterventions: InterventionStatus[] = [
  {
    id: 1,
    status: "Prête",
    description: "Votre intervention pour la salle 101 est prête.",
  },
  {
    id: 2,
    status: "En cours",
    description: "Préparation de l'intervention pour la salle 202 en cours.",
  },
  {
    id: 3,
    status: "Échec",
    description: "Intervention pour la salle 303 a échoué.",
  },
];

const NotificationUser = () => {
  return (
    <DefaultLayout>
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-bold">
          Notifications - Professeur / Administratif
        </h1>
        <ul className="space-y-3">
          {userInterventions.map((item) => (
            <li key={item.id} className="rounded border p-3 hover:bg-gray-100">
              <Link href="/rapport/intervention">
                <div className="block">
                  <div className="font-semibold">{item.status}</div>
                  <div>{item.description}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </DefaultLayout>
  );
};

export default NotificationUser;
