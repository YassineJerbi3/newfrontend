import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:2000";

export interface EquipmentType {
  id: string;
  name: string;
  stockAlerte: number;
}

export interface DepotItem {
  id: string;
  designation: string;
  quantite: number;
  typeConsommable: EquipmentType | null;
}

export interface LigneEntry {
  typeConsommableId: string;
  designation: string;
  quantiteEntree: number;
}

export interface CreateTypeData {
  name: string;
  stockAlerte: number;
}

export interface CreateEntryData {
  observation: string;
  lignes: LigneEntry[];
}

export function useDepotData() {
  const [equipments, setEquipments] = useState<DepotItem[]>([]);
  const [types, setTypes] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [itemsResponse, typesResponse] = await Promise.all([
        fetch(`${API_BASE}/magasin`),
        fetch(`${API_BASE}/types-consommable`),
      ]);

      if (!itemsResponse.ok || !typesResponse.ok) {
        throw new Error("Erreur lors de la récupération des données du dépôt");
      }

      const [items, types] = await Promise.all([
        itemsResponse.json(),
        typesResponse.json(),
      ]);

      setEquipments(items);
      setTypes(types);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setEquipments([]);
      setTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createType = useCallback(
    async (data: CreateTypeData) => {
      try {
        const response = await fetch(`${API_BASE}/types-consommable`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur ${response.status}: ${errorText}`);
        }

        await fetchData();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Erreur inconnue",
        };
      }
    },
    [fetchData],
  );

  const createEntry = useCallback(
    async (data: CreateEntryData) => {
      try {
        const response = await fetch(`${API_BASE}/bons-entree`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur ${response.status}: ${errorText}`);
        }

        await fetchData();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Erreur inconnue",
        };
      }
    },
    [fetchData],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    equipments,
    types,
    loading,
    error,
    createType,
    createEntry,
    refreshData: fetchData,
  };
}
