// src/app/rapport-maintenance/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type RapportForm = {
  technicienId: string;
  responsableId: string;
  travailEffectue: string;
  dateDebut: string;
  dateFin: string;
  dureeHeures: number;
  cout: number;
  externeNom?: string;
  externePrenom?: string;
  externeEmail?: string;
  externeTelephone?: string;
  statut: "SOUMIS" | "VALIDE" | "NON_VALIDE" | "A_CORRIGER";
  dateValidation?: string;
  occurrenceMaintenanceId: string;
};

export default function RapportMaintenancePage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RapportForm>({
    defaultValues: { statut: "SOUMIS" },
  });

  const onSubmit = (data: RapportForm) => {
    // TODO: POST to /api/rapport-maintenance
    console.log("Rapport soumis :", data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <CardTitle className="text-2xl">
            Rapport de maintenance préventif
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Technicien */}
            <div>
              <Label htmlFor="technicienId">ID Technicien</Label>
              <Input
                id="technicienId"
                {...register("technicienId", { required: "Requis" })}
                placeholder="UUID du technicien"
                required
              />
              {errors.technicienId && (
                <p className="text-sm text-red-600">
                  {errors.technicienId.message}
                </p>
              )}
            </div>

            {/* Responsable */}
            <div>
              <Label htmlFor="responsableId">ID Responsable</Label>
              <Input
                id="responsableId"
                {...register("responsableId", { required: "Requis" })}
                placeholder="UUID du responsable"
                required
              />
              {errors.responsableId && (
                <p className="text-sm text-red-600">
                  {errors.responsableId.message}
                </p>
              )}
            </div>

            {/* Travail effectué */}
            <div>
              <Label htmlFor="travailEffectue">Travail effectué</Label>
              <Textarea
                id="travailEffectue"
                {...register("travailEffectue", { required: "Requis" })}
                placeholder="Description du travail réalisé"
                required
                rows={4}
              />
              {errors.travailEffectue && (
                <p className="text-sm text-red-600">
                  {errors.travailEffectue.message}
                </p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="dateDebut">Date de début</Label>
                <Input
                  type="datetime-local"
                  id="dateDebut"
                  {...register("dateDebut", { required: "Requis" })}
                  required
                />
                {errors.dateDebut && (
                  <p className="text-sm text-red-600">
                    {errors.dateDebut.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="dateFin">Date de fin</Label>
                <Input
                  type="datetime-local"
                  id="dateFin"
                  {...register("dateFin", { required: "Requis" })}
                  required
                />
                {errors.dateFin && (
                  <p className="text-sm text-red-600">
                    {errors.dateFin.message}
                  </p>
                )}
              </div>
            </div>

            {/* Durée et coût */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="dureeHeures">Durée (heures)</Label>
                <Input
                  type="number"
                  step="0.1"
                  id="dureeHeures"
                  {...register("dureeHeures", {
                    required: "Requis",
                    valueAsNumber: true,
                  })}
                  required
                />
                {errors.dureeHeures && (
                  <p className="text-sm text-red-600">
                    {errors.dureeHeures.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="cout">Coût (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  id="cout"
                  {...register("cout", {
                    required: "Requis",
                    valueAsNumber: true,
                  })}
                  required
                />
                {errors.cout && (
                  <p className="text-sm text-red-600">{errors.cout.message}</p>
                )}
              </div>
            </div>

            {/* Données externes (optionnelles) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="externeNom">Nom externe</Label>
                <Input
                  id="externeNom"
                  {...register("externeNom")}
                  placeholder="Le cas échéant"
                />
              </div>
              <div>
                <Label htmlFor="externePrenom">Prénom externe</Label>
                <Input
                  id="externePrenom"
                  {...register("externePrenom")}
                  placeholder="Le cas échéant"
                />
              </div>
              <div>
                <Label htmlFor="externeEmail">Email externe</Label>
                <Input
                  type="email"
                  id="externeEmail"
                  {...register("externeEmail")}
                  placeholder="Le cas échéant"
                />
              </div>
              <div>
                <Label htmlFor="externeTelephone">Téléphone externe</Label>
                <Input
                  type="tel"
                  id="externeTelephone"
                  {...register("externeTelephone")}
                  placeholder="Le cas échéant"
                />
              </div>
            </div>

            {/* Statut */}
            <div>
              <Label htmlFor="statut">Statut</Label>
              <Select required>
                <SelectTrigger
                  id="statut"
                  className="w-full"
                  {...register("statut", { required: true })}
                >
                  <SelectValue placeholder="Choisir un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOUMIS">SOUMIS</SelectItem>
                  <SelectItem value="VALIDE">VALIDE</SelectItem>
                  <SelectItem value="NON_VALIDE">NON_VALIDE</SelectItem>
                  <SelectItem value="A_CORRIGER">A_CORRIGER</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date de validation (optionnelle) */}
            <div>
              <Label htmlFor="dateValidation">Date de validation</Label>
              <Input
                type="datetime-local"
                id="dateValidation"
                {...register("dateValidation")}
              />
            </div>

            {/* Occurrence */}
            <div>
              <Label htmlFor="occurrenceMaintenanceId">ID Occurrence</Label>
              <Input
                id="occurrenceMaintenanceId"
                {...register("occurrenceMaintenanceId", { required: "Requis" })}
                placeholder="UUID de l'occurrence"
                required
              />
              {errors.occurrenceMaintenanceId && (
                <p className="text-sm text-red-600">
                  {errors.occurrenceMaintenanceId.message}
                </p>
              )}
            </div>

            {/* Bouton de soumission */}
            <div className="text-right">
              <Button type="submit" className="px-6 py-2">
                Soumettre
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
