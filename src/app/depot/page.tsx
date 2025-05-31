"use client";
import { useEffect, useState, FormEvent } from "react";
import Head from "next/head";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Tag, Archive as ClipboardIcon, Filter } from "lucide-react";

type EquipmentType = { id: string; name: string; stockAlerte: number };
type StockItem = {
  id: string;
  designation: string;
  quantite: number;
  typeConsommable: EquipmentType | null;
};

export default function StockPage() {
  const [equipments, setEquipments] = useState<StockItem[]>([]);
  const [types, setTypes] = useState<EquipmentType[]>([]);
  const [filterType, setFilterType] = useState<string>("");

  const [showAddEquipModal, setShowAddEquipModal] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);

  // États du formulaire “Bon d’entrée”
  const [designation, setDesignation] = useState("");
  const [quantite, setQuantite] = useState<number>(1);
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [observation, setObservation] = useState<string>("");

  // États du formulaire “Nouveau type”
  const [newTypeName, setNewTypeName] = useState("");
  const [stockAlerte, setStockAlerte] = useState<number>(0);

  /** Charge les données depuis le backend (magasin + types) */
  async function loadData() {
    try {
      const [itemsRes, typesRes] = await Promise.all([
        fetch("http://localhost:2000/magasin"),
        fetch("http://localhost:2000/types-consommable"),
      ]);
      const items: StockItem[] = await itemsRes.json();
      const tps: EquipmentType[] = await typesRes.json();
      setEquipments(Array.isArray(items) ? items : []);
      setTypes(Array.isArray(tps) ? tps : []);
    } catch (err) {
      console.error("Erreur lors du chargement du stock :", err);
      setEquipments([]);
      setTypes([]);
    }
  }

  // Au montage, on charge les données
  useEffect(() => {
    loadData();
  }, []);

  /** Création d’un nouveau type consommable */
  async function handleAddType(e: FormEvent) {
    e.preventDefault();
    if (!newTypeName.trim() || stockAlerte < 0) return;

    await fetch("http://localhost:2000/types-consommable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newTypeName.trim(),
        stockAlerte: stockAlerte,
      }),
    });

    // Réinitialiser le formulaire
    setNewTypeName("");
    setStockAlerte(0);
    setShowAddTypeModal(false);
    loadData();
  }

  /** Création d’un bon d’entrée (ajout d’équipement au magasin) */
  async function handleAddEquip(e: FormEvent) {
    e.preventDefault();
    if (
      !designation.trim() ||
      !selectedTypeId ||
      quantite <= 0 ||
      !observation.trim()
    )
      return;

    await fetch("http://localhost:2000/bons-entree", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        designation: designation.trim(),
        typeConsommableId: selectedTypeId,
        quantiteEntree: quantite,
        observation: observation.trim(),
      }),
    });

    // Réinitialiser le formulaire
    setDesignation("");
    setQuantite(1);
    setSelectedTypeId("");
    setObservation("");
    setShowAddEquipModal(false);
    loadData();
  }

  /** Calcule le total en stock par type pour le dashboard */
  const summary = types.map((t) => {
    const totalForThisType = equipments
      .filter((e) => e.typeConsommable?.id === t.id)
      .reduce((sum, e) => sum + e.quantite, 0);
    return { ...t, total: totalForThisType };
  });

  /** Liste filtrée (par type si filterType est défini) */
  const displayed = filterType
    ? equipments.filter((e) => e.typeConsommable?.id === filterType)
    : equipments;

  return (
    <DefaultLayout>
      <>
        <Head>
          <title>Gestion de Stock</title>
        </Head>

        <div className="min-h-screen bg-blue-50 py-10">
          <div className="mx-auto max-w-7xl space-y-12 px-6 lg:px-8">
            {/* --- Top Bar --- */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <h1 className="text-4xl font-extrabold text-blue-900">
                Stock des Équipements
              </h1>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowAddTypeModal(true)}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 px-5 py-2 text-white shadow-md transition hover:shadow-xl"
                >
                  <Tag size={18} /> Nouveau type
                </button>
                <button
                  onClick={() => setShowAddEquipModal(true)}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 px-5 py-2 text-white shadow-md transition hover:shadow-xl"
                >
                  <ClipboardIcon size={18} /> Bon d’entrée
                </button>
              </div>
            </div>

            {/* --- Dashboard par type --- */}
            <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {summary.map((s) => (
                <div
                  key={s.id}
                  className="group relative overflow-hidden rounded-xl bg-white shadow transition hover:shadow-2xl"
                >
                  <div className="p-6">
                    <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                      {s.name}
                    </span>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">TOTAL EN STOCK</p>
                      <p className="mt-2 text-3xl font-bold text-blue-900">
                        {s.total}
                      </p>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Seuil d’alerte : <strong>{s.stockAlerte}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all group-hover:h-2"></div>
                </div>
              ))}
            </section>

            {/* --- Filtre par type --- */}
            <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-end">
              <Filter size={20} className="text-blue-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="ml-2 max-w-xs rounded-lg border border-blue-200 bg-white px-4 py-2 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Tous les types</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* --- Tableau des équipements --- */}
            <div className="overflow-hidden rounded-lg bg-white shadow-lg">
              <table className="w-full table-fixed">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="w-1/2 px-6 py-3 text-left text-sm font-semibold uppercase">
                      Désignation
                    </th>
                    <th className="w-1/4 px-6 py-3 text-left text-sm font-semibold uppercase">
                      Type
                    </th>
                    <th className="w-1/4 px-6 py-3 text-right text-sm font-semibold uppercase">
                      Quantité
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(displayed) && displayed.length > 0 ? (
                    displayed.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={`${
                          idx % 2 === 0 ? "bg-white" : "bg-blue-50"
                        } transition-colors hover:bg-blue-100`}
                      >
                        <td className="px-6 py-4 text-sm text-blue-900">
                          {item.designation}
                        </td>
                        <td className="px-6 py-4 text-sm text-blue-900">
                          {item.typeConsommable?.name || "—"}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-blue-700">
                          {item.quantite}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-8 text-center text-blue-300"
                      >
                        Aucun équipement.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- Modal : Nouveau type consommable --- */}
          {showAddTypeModal && (
            <Modal onClose={() => setShowAddTypeModal(false)}>
              <h3 className="flex items-center gap-2 text-xl font-semibold text-blue-900">
                <Tag size={24} /> Nouveau Type
              </h3>
              <form onSubmit={handleAddType} className="mt-6 space-y-4">
                <Input
                  label="Nom du type (lettres seulement)"
                  value={newTypeName}
                  onChange={(v) => setNewTypeName(v)}
                  placeholder="Ex : CÂBLE HDMI"
                />
                <Input
                  label="Seuil d’alerte"
                  type="number"
                  min={0}
                  value={stockAlerte.toString()}
                  onChange={(v) => setStockAlerte(Number(v))}
                />
                <div className="flex justify-end gap-3 pt-4">
                  <Button outline onClick={() => setShowAddTypeModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">Enregistrer</Button>
                </div>
              </form>
            </Modal>
          )}

          {/* --- Modal : Bon d’entrée --- */}
          {showAddEquipModal && (
            <Modal onClose={() => setShowAddEquipModal(false)}>
              <h3 className="flex items-center gap-2 text-xl font-semibold text-blue-900">
                <ClipboardIcon size={24} /> Bon d’entrée
              </h3>
              <form onSubmit={handleAddEquip} className="mt-6 space-y-4">
                <Input
                  label="Désignation"
                  value={designation}
                  onChange={(v) => setDesignation(v)}
                  placeholder="Ex : SOURIS SANS FIL"
                />
                <Select
                  label="Type"
                  options={types.map((t) => ({
                    value: t.id,
                    label: t.name,
                  }))}
                  value={selectedTypeId}
                  onChange={(v) => setSelectedTypeId(v)}
                />
                <Input
                  label="Quantité"
                  type="number"
                  min={1}
                  value={quantite.toString()}
                  onChange={(v) => setQuantite(Number(v))}
                />
                <Textarea
                  label="Observation"
                  value={observation}
                  onChange={(v) => setObservation(v)}
                  placeholder="Ex : Vérifier avant rangement"
                />
                <div className="flex justify-end gap-3 pt-4">
                  <Button outline onClick={() => setShowAddEquipModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">Enregistrer</Button>
                </div>
              </form>
            </Modal>
          )}
        </div>

        {/* --- Animation d’ouverture des modals --- */}
        <style jsx global>{`
          @keyframes modalIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-modal-in {
            animation: modalIn 0.25s ease-out forwards;
          }
        `}</style>
      </>
    </DefaultLayout>
  );
}

// ===============================
// Composants UI réutilisables
// ===============================

function Modal({ children, onClose }: any) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-blue-900 bg-opacity-30"
      onClick={onClose}
    >
      <div
        className="animate-modal-in w-full max-w-md transform rounded-xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  min,
}: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-blue-700">{label}</label>
      <input
        type={type}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-blue-200 px-4 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}

function Select({ label, options, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-blue-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-blue-200 px-4 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
      >
        <option value="">-- Choisir --</option>
        {options.map((o: any) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder = "" }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-blue-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-blue-200 px-4 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}

function Button({ children, type = "button", outline, ...props }: any) {
  const base = outline
    ? "border border-blue-300 bg-white text-blue-700 hover:bg-blue-50"
    : "bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800";
  return (
    <button
      type={type}
      {...props}
      className={`rounded-md px-4 py-2 font-medium shadow transition ${base}`}
    >
      {children}
    </button>
  );
}
