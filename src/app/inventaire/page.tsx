"use client";

import Link from "next/link";
import React from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
// You can choose different icons or adjust sizes/colors as needed.
import { FiClipboard, FiBox } from "react-icons/fi";

export default function InventairePage() {
  return (
    <DefaultLayout>
      <div className="flex h-full flex-col">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Inventaire & Formulaires</h1>
          <p className="text-gray-600">
            Choisissez une action pour gérer vos équipements et placements
          </p>
        </div>

        {/* Cards Container */}
        <div className="flex flex-1 flex-col gap-6 md:flex-row">
          {/* Card for adding new equipment */}
          <Link href="/inventaire/equipement">
            <div className="flex-1 cursor-pointer rounded-lg bg-blue-600 p-6 shadow-lg transition-all hover:bg-blue-700">
              <div className="mb-4 flex items-center justify-center">
                <FiClipboard size={48} className="text-white" />
              </div>
              <h2 className="text-center text-xl font-semibold text-white">
                Ajouter Nouvel Équipement
              </h2>
            </div>
          </Link>

          {/* Card for adding equipment placement */}
          <Link href="/inventaire/placement">
            <div className="flex-1 cursor-pointer rounded-lg bg-green-600 p-6 shadow-lg transition-all hover:bg-green-700">
              <div className="mb-4 flex items-center justify-center">
                <FiBox size={48} className="text-white" />
              </div>
              <h2 className="text-center text-xl font-semibold text-white">
                Ajouter Placement Équipement
              </h2>
            </div>
          </Link>
        </div>
      </div>
    </DefaultLayout>
  );
}
