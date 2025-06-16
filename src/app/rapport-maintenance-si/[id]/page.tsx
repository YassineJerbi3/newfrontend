"use client";

import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Loader2, X, Check } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";
const fetcher = (url: string) =>
  fetch(`${API}${url}`, { credentials: "include" }).then(async (res) => {
    if (!res.ok) {
      const err = new Error(res.statusText) as any;
      err.status = res.status;
      throw err;
    }
    return res.json();
  });

type Rapport = {
  id: string;
  travailEffectue: string;
  dateDebut: string;
  dateFin: string;
  dureeHeures: number;
  cout: number;
  externeNom?: string;
  externePrenom?: string;
  externeEmail?: string;
  externeTelephone?: string;
  technicien: { prenom: string; nom: string };
  occurrenceMaintenanceId: string;
  statut: "SOUMIS" | "VALIDE" | "NON_VALIDE" | "A_CORRIGER";
};

type OccurrenceDetails = {
  maintenancePreventive: {
    description: string;
    equipement: {
      equipmentType: string;
      emplacement: { nom: string } | null;
    };
  };
};

export default function RapportSIDetails({
  params: { id },
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [showRemark, setShowRemark] = useState(false);
  const [remark, setRemark] = useState("");
  const [processing, setProcessing] = useState(false);

  const {
    data: rapport,
    error: errRapport,
    isLoading: loadingRapport,
  } = useSWR<Rapport>(`/rapport-maintenance/${id}`, fetcher);
  const { data: occurrence, error: errOcc } = useSWR<OccurrenceDetails>(
    () =>
      rapport
        ? `/occurrences-maintenance/${rapport.occurrenceMaintenanceId}`
        : null,
    fetcher,
  );

  const handleUpdate = async (
    status: "VALIDE" | "NON_VALIDE",
    remarque?: string,
  ) => {
    setProcessing(true);
    await fetch(`${API}/rapport-maintenance/${rapport?.id}/statut`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        remarque
          ? { statut: status, remarqueResponsable: remarque }
          : { statut: status },
      ),
    });
    router.refresh();
  };

  if (loadingRapport)
    return (
      <DefaultLayout>
        <div className="flex h-64 items-center justify-center text-gray-500">
          <Loader2 className="mr-2 animate-spin" /> Chargement…
        </div>
      </DefaultLayout>
    );

  if (errRapport || errOcc || !rapport || !occurrence)
    return (
      <DefaultLayout>
        <div className="flex h-64 items-center justify-center font-semibold text-red-600">
          Une erreur s’est produite lors du chargement.
        </div>
      </DefaultLayout>
    );

  const actionable = ["SOUMIS", "A_CORRIGER"].includes(rapport.statut);

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        {/* Title */}
        <div className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 p-6 text-white shadow-lg">
          <h1 className="text-2xl font-bold">Rapport de Maintenance</h1>
          <p className="mt-1 text-sm opacity-90">
            Visualisation complète du rapport soumis par le technicien
          </p>
        </div>

        {/* Équipement */}
        <SectionCard title="🧰 Détails de l’équipement">
          <DetailItem
            label="Équipement"
            value={occurrence.maintenancePreventive.equipement.equipmentType}
          />
          <DetailItem
            label="Emplacement"
            value={
              occurrence.maintenancePreventive.equipement.emplacement?.nom ||
              "—"
            }
          />
          <DetailItem
            label="Description MP"
            value={occurrence.maintenancePreventive.description}
          />
        </SectionCard>

        {/* Technicien */}
        <SectionCard title="👨‍🔧 Technicien assigné">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
              {rapport.technicien.prenom[0]}
              {rapport.technicien.nom[0]}
            </div>
            <div>
              <div className="text-lg font-medium text-blue-700">
                {rapport.technicien.prenom} {rapport.technicien.nom}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Rapport */}
        <SectionCard title="📋 Détails du rapport">
          <DetailItem
            label="Travail effectué"
            value={rapport.travailEffectue}
          />
          <DetailItem
            label="Date de début"
            value={new Date(rapport.dateDebut).toLocaleString("fr-FR")}
          />
          <DetailItem
            label="Date de fin"
            value={new Date(rapport.dateFin).toLocaleString("fr-FR")}
          />
          <DetailItem
            label="Durée (heures)"
            value={`${rapport.dureeHeures} h`}
          />
          <DetailItem
            label="Coût (TND)"
            value={`${rapport.cout.toFixed(2)} DT`}
          />
        </SectionCard>

        {/* Actions */}
        {actionable && (
          <div className="rounded-lg border bg-white p-6 shadow-md">
            {!showRemark ? (
              <div className="flex flex-col justify-end gap-4 sm:flex-row">
                <button
                  onClick={() => handleUpdate("VALIDE")}
                  disabled={processing}
                  className="flex items-center gap-2 rounded-md bg-green-600 px-6 py-2 text-white transition hover:bg-green-700"
                >
                  <Check size={16} /> Valider
                </button>
                <button
                  onClick={() => setShowRemark(true)}
                  disabled={processing}
                  className="flex items-center gap-2 rounded-md bg-red-600 px-6 py-2 text-white transition hover:bg-red-700"
                >
                  <X size={16} /> Non valider
                </button>
              </div>
            ) : (
              <div>
                <textarea
                  rows={3}
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2"
                  placeholder="Remarque du responsable..."
                />
                <div className="mt-3 flex justify-end gap-3">
                  <button
                    onClick={() =>
                      remark.trim() && handleUpdate("NON_VALIDE", remark.trim())
                    }
                    disabled={processing}
                    className="rounded-md bg-red-600 px-6 py-2 text-white transition hover:bg-red-700"
                  >
                    Envoyer & invalider
                  </button>
                  <button
                    onClick={() => {
                      setShowRemark(false);
                      setRemark("");
                    }}
                    className="rounded-md border px-6 py-2"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}

// Reusable Components
function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold text-blue-700">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-sm text-gray-500">{label}</span>
      <span className="mt-1 block font-semibold text-gray-800">{value}</span>
    </div>
  );
}
