"use client";

import { useState } from "react";
import {
  EquipmentType,
  CreateTypeData,
  CreateEntryData,
  LigneEntry,
} from "@/hooks/useDepotData";
import { X, Plus, Trash2, Package, ClipboardList, Loader2 } from "lucide-react";

interface DepotModalsProps {
  showAddTypeModal: boolean;
  showAddEntryModal: boolean;
  types: EquipmentType[];
  onCloseTypeModal: () => void;
  onCloseEntryModal: () => void;
  onCreateType: (
    data: CreateTypeData,
  ) => Promise<{ success: boolean; error?: string }>;
  onCreateEntry: (
    data: CreateEntryData,
  ) => Promise<{ success: boolean; error?: string }>;
}

export function DepotModals({
  showAddTypeModal,
  showAddEntryModal,
  types,
  onCloseTypeModal,
  onCloseEntryModal,
  onCreateType,
  onCreateEntry,
}: DepotModalsProps) {
  return (
    <>
      {showAddTypeModal && (
        <AddTypeModal onClose={onCloseTypeModal} onCreate={onCreateType} />
      )}
      {showAddEntryModal && (
        <AddEntryModal
          types={types}
          onClose={onCloseEntryModal}
          onCreate={onCreateEntry}
        />
      )}
    </>
  );
}

function AddTypeModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (
    data: CreateTypeData,
  ) => Promise<{ success: boolean; error?: string }>;
}) {
  const [name, setName] = useState("");
  const [stockAlerte, setStockAlerte] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    const result = await onCreate({
      name: name.trim(),
      stockAlerte,
    });

    if (result.success) {
      onClose();
      setName("");
      setStockAlerte(5);
    } else {
      setError(result.error || "Une erreur est survenue");
    }

    setLoading(false);
  };

  return (
    <Modal onClose={onClose}>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
          <Package className="h-5 w-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Nouveau Type d'Équipement Dépôt
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Nom du type
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Câbles HDMI"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Seuil d'alerte dépôt
          </label>
          <input
            type="number"
            value={stockAlerte}
            onChange={(e) => setStockAlerte(Number(e.target.value))}
            min="0"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Quantité en dessous de laquelle une alerte sera affichée pour le
            dépôt
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Créer le type
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AddEntryModal({
  types,
  onClose,
  onCreate,
}: {
  types: EquipmentType[];
  onClose: () => void;
  onCreate: (
    data: CreateEntryData,
  ) => Promise<{ success: boolean; error?: string }>;
}) {
  const [observation, setObservation] = useState("");
  const [lines, setLines] = useState<LigneEntry[]>([
    { typeConsommableId: "", designation: "", quantiteEntree: 1 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!observation.trim() || lines.length === 0) return;

    const validLines = lines.filter(
      (line) =>
        line.typeConsommableId &&
        line.designation.trim() &&
        line.quantiteEntree > 0,
    );

    if (validLines.length === 0) {
      setError("Veuillez remplir au moins une ligne valide");
      return;
    }

    setLoading(true);
    setError("");

    const result = await onCreate({
      observation: observation.trim(),
      lignes: validLines,
    });

    if (result.success) {
      onClose();
      setObservation("");
      setLines([{ typeConsommableId: "", designation: "", quantiteEntree: 1 }]);
    } else {
      setError(result.error || "Une erreur est survenue");
    }

    setLoading(false);
  };

  const addLine = () => {
    setLines([
      ...lines,
      { typeConsommableId: "", designation: "", quantiteEntree: 1 },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const updateLine = (index: number, data: Partial<LigneEntry>) => {
    setLines(
      lines.map((line, i) => (i === index ? { ...line, ...data } : line)),
    );
  };

  return (
    <Modal onClose={onClose} size="large">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
          <ClipboardList className="h-5 w-5 text-indigo-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Nouveau Bon d'Entrée Dépôt
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Observation
          </label>
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Commentaires sur cette entrée de stock au dépôt..."
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Articles pour le dépôt
            </h3>
            <button
              type="button"
              onClick={addLine}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200"
            >
              <Plus className="h-4 w-4" />
              Ajouter une ligne
            </button>
          </div>

          <div className="space-y-4">
            {lines.map((line, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-12"
              >
                <div className="md:col-span-4">
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Type d'équipement
                  </label>
                  <select
                    value={line.typeConsommableId}
                    onChange={(e) =>
                      updateLine(index, { typeConsommableId: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner un type</option>
                    {types.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-5">
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Désignation
                  </label>
                  <input
                    type="text"
                    value={line.designation}
                    onChange={(e) =>
                      updateLine(index, { designation: e.target.value })
                    }
                    placeholder="Ex: Souris sans fil Logitech"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Quantité
                  </label>
                  <input
                    type="number"
                    value={line.quantiteEntree}
                    onChange={(e) =>
                      updateLine(index, {
                        quantiteEntree: Number(e.target.value),
                      })
                    }
                    min="1"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex items-end md:col-span-1">
                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    disabled={lines.length <= 1}
                    className="p-2 text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || !observation.trim()}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Enregistrer le bon
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({
  children,
  onClose,
  size = "default",
}: {
  children: React.ReactNode;
  onClose: () => void;
  size?: "default" | "large";
}) {
  const sizeClasses = {
    default: "max-w-md",
    large: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        className={`w-full ${sizeClasses[size]} transform rounded-xl bg-white shadow-2xl transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="p-2 text-gray-400 transition-colors hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}
