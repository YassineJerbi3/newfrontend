// src/app/rapport-maintenance/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useForm, Controller } from "react-hook-form";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";

type OccurrenceWithRelations = {
  id: string;
  dateOccurrence: string;
  maintenancePreventive: {
    description: string;
    equipement: {
      equipmentType: string;
      numeroSerie: string;
      emplacement: { nom: string } | null;
      poste: { numero: number } | null;
    };
  };
};

const fetcher = (url: string) =>
  fetch(`${API}${url}`, { credentials: "include" }).then((res) => {
    if (!res.ok) throw new Error("Erreur réseau");
    return res.json();
  });

export default function RapportPreventifPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: occ, error } = useSWR<OccurrenceWithRelations>(
    `/occurrences-maintenance/${id}`,
    fetcher,
  );

  // Flag “rapport déjà envoyé”
  const [submitted, setSubmitted] = useState(false);
  // Contrôle affichage des champs sous‑traitant
  const [isSub, setIsSub] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      occurrenceMaintenanceId: id,
      travailEffectue: "",
      dateDebut: "",
      dateFin: "",
      dureeHeures: 0,
      cout: 0,
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      typeRealisation: "interne",
    },
  });

  // Dès que l’API occ est là, on peut préremplir si nécessaire
  useEffect(() => {
    if (occ) {
      // Par exemple on pourrait reset({ ...existingRapport })
    }
  }, [occ]);

  const onSubmit = async (data: any) => {
    try {
      await fetch(`${API}/rapport-maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      // Marque soumis, désactive champs
      setSubmitted(true);
      // Rafraîchit la page (recharge les données si besoin)
      //  setTimeout(() => window.location.reload(), 500);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la soumission du rapport");
    }
  };

  if (error)
    return (
      <DefaultLayout>
        <p className="p-6 text-red-600">
          Erreur de chargement de l’occurrence : {error.message}
        </p>
      </DefaultLayout>
    );
  if (!occ)
    return (
      <DefaultLayout>
        <p className="p-6 text-gray-500">Chargement des données…</p>
      </DefaultLayout>
    );

  return (
    <DefaultLayout>
      <div className="flex min-h-screen justify-center bg-gray-50 p-6">
        <Card className="w-full max-w-3xl shadow-lg">
          <CardHeader className="rounded-t-lg bg-gradient-to-r from-green-500 to-teal-600 p-4 text-white">
            <CardTitle className="text-2xl">
              Rapport de maintenance préventif
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* --- Infos équipement --- */}
            <section className="space-y-2 border-b pb-4">
              <p>
                <strong>Équipement :</strong>{" "}
                {occ.maintenancePreventive.equipement.equipmentType}
              </p>
              <p>
                <strong>N° de série :</strong>{" "}
                {occ.maintenancePreventive.equipement.numeroSerie}
              </p>
              <p>
                <strong>Maintenance préventive :</strong>{" "}
                {occ.maintenancePreventive.description}
              </p>
              <p>
                <strong>Emplacement :</strong>{" "}
                {occ.maintenancePreventive.equipement.emplacement?.nom || "—"}
              </p>
              {occ.maintenancePreventive.equipement.poste && (
                <p>
                  <strong>Poste :</strong>{" "}
                  {occ.maintenancePreventive.equipement.poste.numero}
                </p>
              )}
            </section>

            {/* --- Formulaire de rapport --- */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Travail effectué */}
              <div>
                <Label htmlFor="travailEffectue">Travail effectué *</Label>
                <Textarea
                  id="travailEffectue"
                  {...register("travailEffectue", { required: true })}
                  rows={4}
                  className="mt-1"
                  disabled={submitted}
                />
                {errors.travailEffectue && (
                  <p className="mt-1 text-sm text-red-600">
                    Ce champ est obligatoire.
                  </p>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {["dateDebut", "dateFin"].map((field, idx) => (
                  <div key={field}>
                    <Label htmlFor={field}>
                      {idx === 0 ? "Date de début" : "Date de fin"} *
                    </Label>
                    <Input
                      type="datetime-local"
                      id={field}
                      {...register(field, { required: true })}
                      className="mt-1"
                      disabled={submitted}
                    />
                    {errors[field as "dateDebut" | "dateFin"] && (
                      <p className="mt-1 text-sm text-red-600">Obligatoire.</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Durée & Coût */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="dureeHeures">Durée (heures) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    id="dureeHeures"
                    {...register("dureeHeures", {
                      required: true,
                      valueAsNumber: true,
                    })}
                    className="mt-1"
                    disabled={submitted}
                  />
                  {errors.dureeHeures && (
                    <p className="mt-1 text-sm text-red-600">Obligatoire.</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cout">Coût (TND) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    id="cout"
                    {...register("cout", {
                      required: true,
                      valueAsNumber: true,
                    })}
                    className="mt-1"
                    disabled={submitted}
                  />
                  {errors.cout && (
                    <p className="mt-1 text-sm text-red-600">Obligatoire.</p>
                  )}
                </div>
              </div>

              {/* Interne vs Sous‑traitant */}
              <div>
                <Label>Type de réalisation *</Label>
                <Controller
                  control={control}
                  name="typeRealisation"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={(v) => {
                        field.onChange(v);
                        setIsSub(v === "sousTraitant");
                      }}
                      value={field.value}
                      className="mt-2 flex space-x-6"
                    >
                      <label className="flex items-center space-x-1">
                        <RadioGroupItem
                          value="interne"
                          id="interne"
                          disabled={submitted}
                        />
                        <span>Interne</span>
                      </label>
                      <label className="flex items-center space-x-1">
                        <RadioGroupItem
                          value="sousTraitant"
                          id="sousTraitant"
                          disabled={submitted}
                        />
                        <span>Sous‑traitant</span>
                      </label>
                    </RadioGroup>
                  )}
                />
              </div>

              {/* Champs Sous‑traitant (conditionnels) */}
              {isSub && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {["nom", "prenom", "email", "telephone"].map((field) => (
                    <div key={field}>
                      <Label htmlFor={field}>
                        {field.charAt(0).toUpperCase() + field.slice(1)} *
                      </Label>
                      <Input
                        type={field === "email" ? "email" : "text"}
                        id={field}
                        {...register(field, { required: true })}
                        className="mt-1"
                        disabled={submitted}
                      />
                      {errors[
                        field as "nom" | "prenom" | "email" | "telephone"
                      ] && (
                        <p className="mt-1 text-sm text-red-600">
                          Obligatoire.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Champ caché */}
              <input
                type="hidden"
                value={id}
                {...register("occurrenceMaintenanceId")}
              />

              {/* Bouton Soumettre */}
              <div className="text-right">
                <Button
                  type="submit"
                  disabled={isSubmitting || submitted}
                  className="bg-green-600 px-6 py-2 text-white hover:bg-green-700"
                >
                  {submitted
                    ? "Rapport envoyé"
                    : isSubmitting
                      ? "Envoi…"
                      : "Envoyer le rapport"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DefaultLayout>
  );
}
