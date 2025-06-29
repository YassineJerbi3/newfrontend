// src/app/magasin/history/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

interface Ligne {
  id: string;
  quantiteSortie: number;
  articleMagasin: {
    id: string;
    designation: string;
  };
}

interface BonSortie {
  id: string;
  dateSortie: string;
  lignes: Ligne[];
}

interface GroupedBons {
  [date: string]: BonSortie[];
}

export default function BonSortieHistoryPage() {
  const [groupedBons, setGroupedBons] = useState<GroupedBons>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:2000/bons-sortie")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur récupération");
        return res.json();
      })
      .then((data: BonSortie[]) => {
        const groups: GroupedBons = {};
        data.forEach((bon) => {
          const date = format(new Date(bon.dateSortie), "dd/MM/yyyy");
          groups[date] ||= [];
          groups[date].push(bon);
        });
        const sortedDates = Object.keys(groups).sort(
          (a, b) =>
            new Date(b.split("/").reverse().join("-")).getTime() -
            new Date(a.split("/").reverse().join("-")).getTime(),
        );
        const sortedGroups: GroupedBons = {};
        sortedDates.forEach((d) => (sortedGroups[d] = groups[d]));
        setGroupedBons(sortedGroups);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-600">
        Chargement...
      </div>
    );
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl space-y-12 p-6">
        {/* Page Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Historique des Bons de sortie
          </h1>
        </header>

        {/* Sections by Date */}
        {Object.entries(groupedBons).map(([date, bons]) => (
          <section key={date} className="space-y-4">
            {/* Date Title */}
            <div className="rounded-md bg-gray-100 p-3 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-700">{date}</h2>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {bons.map((bon) => (
                <div
                  key={bon.id}
                  className="rounded-lg border border-gray-200 bg-white shadow transition-shadow hover:shadow-lg"
                >
                  <div className="border-b border-gray-100 p-4">
                    <h3 className="text-lg font-medium text-gray-800">
                      Bon de sortie
                    </h3>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-2">
                      {bon.lignes.map((ligne) => (
                        <li
                          key={ligne.id}
                          className="flex justify-between text-gray-700"
                        >
                          <span className="truncate">
                            {ligne.articleMagasin.designation}
                          </span>
                          <span className="font-semibold">
                            {ligne.quantiteSortie}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </DefaultLayout>
  );
}
