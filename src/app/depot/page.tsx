"use client";

import { useEffect, useState } from "react";
import { useDepotData } from "@/hooks/useDepotData";
import { Loader2, Package } from "lucide-react";
import { DepotModals } from "@/components/depot/DepotModals";
import { DepotTable } from "@/components/depot/DepotTable";
import { DepotFilters } from "@/components/depot/DepotFilters";
import { DepotDashboard } from "@/components/depot/DepotDashboard";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export default function DepotPage() {
  const {
    equipments,
    types,
    loading,
    error,
    createType,
    createEntry,
    refreshData,
  } = useDepotData();

  const [filterType, setFilterType] = useState<string>("");
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);

  const filteredEquipments = filterType
    ? equipments.filter((e) => e.typeConsommable?.id === filterType)
    : equipments;

  const summary = types.map((type) => {
    const total = equipments
      .filter((e) => e.typeConsommable?.id === type.id)
      .reduce((sum, e) => sum + e.quantite, 0);
    return { ...type, total };
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
          <p className="font-medium text-blue-600">
            Chargement des données du dépôt...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="rounded-xl bg-white p-8 text-center shadow-lg">
          <Package className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold text-red-700">
            Erreur de connexion
          </h2>
          <p className="mb-4 text-red-600">{error}</p>
          <button
            onClick={refreshData}
            className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto max-w-7xl px-6 py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="mb-2 text-4xl font-bold text-gray-900">
                Gestion du Dépôt
              </h1>
              <p className="text-gray-600">
                Gérez vos équipements et consommables du dépôt en temps réel
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAddTypeModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-white shadow-md transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
              >
                <Package className="h-4 w-4" />
                Nouveau Type
              </button>

              <button
                onClick={() => setShowAddEntryModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2 text-white shadow-md transition-all duration-200 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-lg"
              >
                <Loader2 className="h-4 w-4" />
                Bon d'Entrée
              </button>
            </div>
          </div>

          {/* Dashboard Cards */}
          <DepotDashboard summary={summary} />

          {/* Filters */}
          <DepotFilters
            types={types}
            filterType={filterType}
            onFilterChange={setFilterType}
          />

          {/* Equipment Table */}
          <DepotTable equipments={filteredEquipments} />

          {/* Modals */}
          <DepotModals
            showAddTypeModal={showAddTypeModal}
            showAddEntryModal={showAddEntryModal}
            types={types}
            onCloseTypeModal={() => setShowAddTypeModal(false)}
            onCloseEntryModal={() => setShowAddEntryModal(false)}
            onCreateType={createType}
            onCreateEntry={createEntry}
          />
        </div>
      </div>
    </DefaultLayout>
  );
}
