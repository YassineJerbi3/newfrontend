"use client";
import Link from "next/link";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React from "react";
import { FaDesktop } from "react-icons/fa"; // Icône représentant un ordinateur

export default function ClasseSelectionPage() {
  // Tableau des classes.
  const classes = ["TP1", "TP2", "TP3", "TP4", "TP5"];

  return (
    <DefaultLayout>
      <div className="flex min-h-screen flex-col items-center justify-center bg-white">
        <h1 className="mb-8 text-4xl font-extrabold text-gray-800">
          Sélectionnez la classe
        </h1>
        <div className="flex flex-wrap justify-center gap-6">
          {classes.map((classe) => (
            <Link
              key={classe}
              href={`/${classe.toLowerCase()}`}
              className="block"
            >
              <div className="flex h-20 w-64 items-center justify-center bg-gray-200 shadow-md transition-colors duration-300 hover:bg-gray-300">
                <FaDesktop className="mr-4 text-gray-700" size={30} />
                <span className="text-2xl font-bold text-gray-800">
                  {classe}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
}
