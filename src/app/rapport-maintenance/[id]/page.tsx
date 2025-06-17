"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  Wrench,
  FileText,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";

export default function RapportPreventifPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const router = useRouter();

  // modes: "occurrence" = création, "rapport" = correction après invalidation
  const [mode, setMode] = useState<"occurrence" | "rapport">("occurrence");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSub, setIsSub] = useState(false);
  const [showRemarque, setShowRemarque] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // react-hook-form
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
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

  // Watch typeRealisation pour gérer l'affichage des champs sous-traitant
  const typeRealisation = watch("typeRealisation");

  // format ISO -> "YYYY-MM-DDThh:mm"
  const formatForInput = (iso: string) => {
    const dt = new Date(iso);
    const tzOffsetMs = dt.getTimezoneOffset() * 60000;
    const localDt = new Date(dt.getTime() - tzOffsetMs);
    return localDt.toISOString().slice(0, 16);
  };

  // charge occurrence ou rapport selon l'id
  useEffect(() => {
    setLoading(true);
    fetch(`${API}/occurrences-maintenance/${id}`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (res.ok) {
          const occ = await res.json();
          setMode("occurrence");
          setData(occ);
          setSubmitted(false); // Nouveau rapport
        } else if (res.status === 404) {
          // pas d'occurrence -> c'est un rapportId
          const rapRes = await fetch(`${API}/rapport-maintenance/${id}`, {
            credentials: "include",
          });
          if (!rapRes.ok) throw new Error("Rapport introuvable");
          const rap = await rapRes.json();
          setMode("rapport");
          setData(rap);
          // Vérifier si le rapport est déjà validé/envoyé
          setSubmitted(rap.statut === "valide" || rap.dateEnvoi);
        } else {
          throw new Error(res.statusText);
        }
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // préremplissage et gestion de la modal automatique pour mode="rapport"
  useEffect(() => {
    if (mode === "rapport" && data && initialLoad) {
      // data est le RapportMaintenance
      const r = data;
      const occ = r.occurrence;

      // Déterminer le type de réalisation basé sur les données existantes
      const isSubcontractor = !!(
        r.externeNom ||
        r.externePrenom ||
        r.externeEmail ||
        r.externeTelephone
      );

      reset({
        occurrenceMaintenanceId: occ.id,
        travailEffectue: r.travailEffectue || "",
        dateDebut: r.dateDebut ? formatForInput(r.dateDebut) : "",
        dateFin: r.dateFin ? formatForInput(r.dateFin) : "",
        dureeHeures: r.dureeHeures || 0,
        cout: r.cout || 0,
        nom: r.externeNom || "",
        prenom: r.externePrenom || "",
        email: r.externeEmail || "",
        telephone: r.externeTelephone || "",
        typeRealisation: isSubcontractor ? "sousTraitant" : "interne",
      });

      // Définir l'état des champs sous-traitant basé sur les données
      setIsSub(isSubcontractor);

      // Ouvrir automatiquement la modal si remarque existe et pas encore soumis
      if (r.remarqueResponsable && !submitted) {
        setTimeout(() => {
          setShowRemarque(true);
        }, 800); // Délai pour laisser la page se charger
      }

      setInitialLoad(false);
    }
  }, [mode, data, reset, initialLoad, submitted]);

  // Gérer le changement de type de réalisation
  useEffect(() => {
    setIsSub(typeRealisation === "sousTraitant");
  }, [typeRealisation]);

  const onSubmit = async (formData: any) => {
    try {
      // 1️⃣ Construire le payload en mappant nom/prenom/email/telephone vers les clés externes
      const payload = {
        ...formData,
        externeNom: formData.nom,
        externePrenom: formData.prenom,
        externeEmail: formData.email,
        externeTelephone: formData.telephone,
      };
      // 2️⃣ Supprimer les anciennes clés
      delete payload.nom;
      delete payload.prenom;
      delete payload.email;
      delete payload.telephone;

      // 3️⃣ Choisir l’URL selon le mode (création vs correction)
      const url =
        mode === "occurrence"
          ? `${API}/rapport-maintenance`
          : `${API}/rapport-maintenance/${id}/contenu`;
      const method = mode === "occurrence" ? "POST" : "PATCH";

      // 4️⃣ Envoyer le payload correct au back
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      setSubmitted(true);

      // Le reste de votre logique (marquer la notif invalide et redirection) reste inchangé…
      // ─── Marquer la notif “invalide” comme lue ───
      const rawNotifs: { id: string; type: string; payload: any }[] =
        await fetch(`${API}/notifications`, { credentials: "include" }).then(
          (r) => r.json(),
        );

      const invalNotif = rawNotifs.find(
        (n) =>
          n.type === "RAPPORT_MAINTENANCE_INVALIDE" &&
          n.payload.rapportId === id,
      );

      if (invalNotif) {
        await fetch(`${API}/notifications/${invalNotif.id}/read`, {
          method: "PATCH",
          credentials: "include",
        });
      }

      router.push("/notification/not-technicien");
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la soumission");
    }
  };

  const planDateString =
    mode === "occurrence"
      ? data?.datePlanification
      : data?.occurrence?.datePlanification;

  const planDate = planDateString ? new Date(planDateString) : null;
  const watchDateDebut = watch("dateDebut");

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="animate-pulse font-medium text-blue-600">
              Chargement des données…
            </p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex flex-col items-center space-y-4 text-center">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <p className="text-xl font-semibold text-red-700">{error}</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // extrait infos équipement selon mode
  const equip =
    mode === "occurrence"
      ? data.maintenancePreventive.equipement
      : data.occurrence.maintenancePreventive.equipement;
  const desc =
    mode === "occurrence"
      ? data.maintenancePreventive.description
      : data.occurrence.maintenancePreventive.description;

  // Vérifier si une remarque existe
  const hasRemarque =
    data?.remarqueResponsable && data.remarqueResponsable.trim() !== "";

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">
          <Card className="animate-in slide-in-from-bottom-4 overflow-hidden border-0 bg-white/95 shadow-2xl backdrop-blur-sm duration-700">
            <CardHeader
              className={`relative overflow-hidden p-6 text-white ${
                mode === "occurrence"
                  ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600"
                  : "bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600"
              }`}
            >
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
              <div className="relative flex items-center justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
                    {submitted ? (
                      <CheckCircle className="animate-in zoom-in h-8 w-8 duration-500" />
                    ) : (
                      <FileText className="h-8 w-8" />
                    )}
                    {mode === "occurrence"
                      ? submitted
                        ? "Rapport envoyé avec succès"
                        : "Rapport de maintenance préventif"
                      : submitted
                        ? "Correction envoyée avec succès"
                        : "Correction du rapport"}
                  </CardTitle>
                  <p className="text-sm text-white/90">
                    {mode === "occurrence"
                      ? "Complétez les informations de maintenance"
                      : submitted
                        ? "Votre correction a été prise en compte"
                        : "Corrigez les informations selon les remarques"}
                  </p>
                </div>
                {hasRemarque && (
                  <button
                    onClick={() => setShowRemarque(true)}
                    className="group relative rounded-full bg-white/20 p-3 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                    title="Voir la remarque du responsable"
                  >
                    <AlertCircle className="h-6 w-6 transition-transform group-hover:rotate-12" />
                    <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-red-500"></span>
                  </button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-8 p-6 sm:p-8">
              {/* Message de succès si déjà soumis */}
              {submitted && (
                <div className="animate-in slide-in-from-top-4 rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6 duration-500">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-green-800">
                        {mode === "occurrence"
                          ? "Rapport envoyé"
                          : "Correction envoyée"}
                      </h3>
                      <p className="text-sm text-green-700">
                        {mode === "occurrence"
                          ? "Votre rapport a été envoyé avec succès et est en attente de validation."
                          : "Votre correction a été envoyée et sera examinée par le responsable."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Infos Équipement */}
              <section className="animate-in fade-in-50 space-y-4 rounded-xl border border-blue-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 delay-200 duration-500">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-800">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  Informations de l'équipement
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg border border-blue-200/50 bg-white/70 p-3">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600">Type d'équipement</p>
                      <p className="font-medium text-blue-800">
                        {equip.equipmentType}
                      </p>
                    </div>
                  </div>
                  {equip.numeroSerie && (
                    <div className="flex items-center gap-3 rounded-lg border border-blue-200/50 bg-white/70 p-3">
                      <div className="font-mono flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-xs text-white">
                        #
                      </div>
                      <div>
                        <p className="text-sm text-blue-600">N° de série</p>
                        <p className="font-medium text-blue-800">
                          {equip.numeroSerie}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 rounded-lg border border-blue-200/50 bg-white/70 p-3 sm:col-span-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-indigo-600 text-xs text-white">
                      M
                    </div>
                    <div>
                      <p className="text-sm text-blue-600">
                        Maintenance préventive
                      </p>
                      <p className="font-medium text-blue-800">{desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-blue-200/50 bg-white/70 p-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-cyan-600 text-xs text-white">
                      📍
                    </div>
                    <div>
                      <p className="text-sm text-blue-600">Emplacement</p>
                      <p className="font-medium text-blue-800">
                        {equip.emplacement?.nom || "—"}
                      </p>
                    </div>
                  </div>
                  {equip.poste && (
                    <div className="flex items-center gap-3 rounded-lg border border-blue-200/50 bg-white/70 p-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-700 text-xs text-white">
                        P
                      </div>
                      <div>
                        <p className="text-sm text-blue-600">Poste</p>
                        <p className="font-medium text-blue-800">
                          {equip.poste.numero}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Formulaire */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="animate-in fade-in-50 space-y-8 delay-300 duration-500"
              >
                {/* Travail effectué */}
                <div className="space-y-3">
                  <Label
                    htmlFor="travailEffectue"
                    className="flex items-center gap-2 text-base font-semibold text-blue-700"
                  >
                    <Wrench className="h-4 w-4" />
                    Travail effectué *
                  </Label>
                  <Textarea
                    id="travailEffectue"
                    {...register("travailEffectue", { required: true })}
                    rows={4}
                    className="resize-none border-blue-300 transition-all duration-200 focus:border-blue-500 focus:ring-blue-500/20"
                    placeholder="Décrivez en détail le travail effectué..."
                    disabled={submitted}
                  />
                  {errors.travailEffectue && (
                    <p className="animate-in slide-in-from-left-2 flex items-center gap-1 text-sm text-red-600 duration-300">
                      <AlertCircle className="h-4 w-4" />
                      Ce champ est obligatoire.
                    </p>
                  )}
                </div>

                {/* Dates début / fin */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Date de début */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="dateDebut"
                      className="flex items-center gap-2 text-base font-semibold text-blue-700"
                    >
                      <Calendar className="h-4 w-4" />
                      Date de début *
                    </Label>
                    <Input
                      type="datetime-local"
                      id="dateDebut"
                      disabled={submitted}
                      {...register("dateDebut", {
                        required: "La date de début est obligatoire",
                        validate: (value: string) => {
                          if (!planDate)
                            return "Date de planification introuvable";
                          const debut = new Date(value);
                          return (
                            debut >= planDate ||
                            `La date de début doit être ≥ date de planification (${planDate.toISOString().slice(0, 10)})`
                          );
                        },
                      })}
                      className="border-blue-300 transition-all duration-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                    {errors.dateDebut && (
                      <p className="text-sm text-red-600">
                        {errors.dateDebut.message}
                      </p>
                    )}
                  </div>

                  {/* Date de fin */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="dateFin"
                      className="flex items-center gap-2 text-base font-semibold text-blue-700"
                    >
                      <Calendar className="h-4 w-4" />
                      Date de fin *
                    </Label>
                    <Input
                      type="datetime-local"
                      id="dateFin"
                      disabled={submitted}
                      {...register("dateFin", {
                        required: "La date de fin est obligatoire",
                        validate: (value: string) => {
                          const debut = new Date(watchDateDebut);
                          if (isNaN(debut.getTime()))
                            return "Veuillez d’abord choisir la date de début";
                          const fin = new Date(value);
                          return (
                            fin >= debut ||
                            "La date de fin doit être ≥ la date de début"
                          );
                        },
                      })}
                      className="border-blue-300 transition-all duration-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                    {errors.dateFin && (
                      <p className="text-sm text-red-600">
                        {errors.dateFin.message}
                      </p>
                    )}
                  </div>
                </div>
                {/* Durée & Coût */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-3">
                    <Label
                      htmlFor="dureeHeures"
                      className="flex items-center gap-2 text-base font-semibold text-blue-700"
                    >
                      <Clock className="h-4 w-4" />
                      Durée (heures) *
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      id="dureeHeures"
                      {...register("dureeHeures", {
                        required: true,
                        valueAsNumber: true,
                      })}
                      className="border-blue-300 transition-all duration-200 focus:border-blue-500 focus:ring-blue-500/20"
                      placeholder="0.0"
                      disabled={submitted}
                    />
                    {errors.dureeHeures && (
                      <p className="animate-in slide-in-from-left-2 flex items-center gap-1 text-sm text-red-600 duration-300">
                        <AlertCircle className="h-4 w-4" />
                        Obligatoire.
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="cout"
                      className="flex items-center gap-2 text-base font-semibold text-blue-700"
                    >
                      <DollarSign className="h-4 w-4" />
                      Coût (TND) *
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      id="cout"
                      {...register("cout", {
                        required: true,
                        valueAsNumber: true,
                      })}
                      className="border-blue-300 transition-all duration-200 focus:border-blue-500 focus:ring-blue-500/20"
                      placeholder="0.00"
                      disabled={submitted}
                    />
                    {errors.cout && (
                      <p className="animate-in slide-in-from-left-2 flex items-center gap-1 text-sm text-red-600 duration-300">
                        <AlertCircle className="h-4 w-4" />
                        Obligatoire.
                      </p>
                    )}
                  </div>
                </div>

                {/* Type de réalisation */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-base font-semibold text-blue-700">
                    <User className="h-4 w-4" />
                    Type de réalisation *
                  </Label>
                  <fieldset disabled={submitted}>
                    <Controller
                      control={control}
                      name="typeRealisation"
                      rules={{ required: true }}
                      render={({ field }) => (
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col gap-4 sm:flex-row"
                        >
                          <label className="group flex cursor-pointer items-center space-x-3 rounded-xl border-2 border-blue-200 p-4 transition-all duration-200 hover:border-blue-400">
                            <RadioGroupItem
                              value="interne"
                              id="interne"
                              className="text-blue-600"
                            />
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500 transition-transform duration-200 group-hover:scale-125"></div>
                              <span className="font-medium text-blue-700">
                                Réalisation interne
                              </span>
                            </div>
                          </label>
                          <label className="group flex cursor-pointer items-center space-x-3 rounded-xl border-2 border-blue-200 p-4 transition-all duration-200 hover:border-blue-400">
                            <RadioGroupItem
                              value="sousTraitant"
                              id="sousTraitant"
                              className="text-blue-600"
                            />
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-indigo-500 transition-transform duration-200 group-hover:scale-125"></div>
                              <span className="font-medium text-blue-700">
                                Sous-traitant externe
                              </span>
                            </div>
                          </label>
                        </RadioGroup>
                      )}
                    />
                  </fieldset>
                </div>

                {/* Champs sous-traitant */}
                {isSub && (
                  <div className="animate-in slide-in-from-top-4 space-y-6 rounded-xl border border-indigo-200/50 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 duration-500">
                    <h4 className="flex items-center gap-2 text-lg font-semibold text-indigo-800">
                      <User className="h-5 w-5" />
                      Informations du sous-traitant
                    </h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {(["nom", "prenom", "email", "telephone"] as const).map(
                        (field) => (
                          <div key={field} className="space-y-2">
                            <Label
                              htmlFor={field}
                              className="text-sm font-medium text-blue-700"
                            >
                              {field === "nom"
                                ? "Nom"
                                : field === "prenom"
                                  ? "Prénom"
                                  : field === "email"
                                    ? "Email"
                                    : "Téléphone"}{" "}
                              *
                            </Label>
                            <Input
                              type={field === "email" ? "email" : "text"}
                              id={field}
                              {...register(field, { required: true })}
                              className="border-indigo-300 transition-all duration-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                              disabled={submitted}
                            />
                            {errors[field] && (
                              <p className="animate-in slide-in-from-left-2 flex items-center gap-1 text-sm text-red-600 duration-300">
                                <AlertCircle className="h-4 w-4" />
                                Obligatoire.
                              </p>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                <input
                  type="hidden"
                  value={mode === "occurrence" ? id : data.occurrence.id}
                  {...register("occurrenceMaintenanceId")}
                />

                {/* Bouton Soumettre */}
                {!submitted && (
                  <div className="flex justify-end pt-6">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="transform rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-indigo-700 focus:scale-105"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                          Envoi en cours…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {mode === "occurrence"
                            ? "Envoyer le rapport"
                            : "Envoyer la correction"}
                        </span>
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Remarque avec animations améliorées */}
      {showRemarque && hasRemarque && (
        <div
          className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-300"
          onClick={() => setShowRemarque(false)}
        >
          <div
            className="animate-in zoom-in-95 slide-in-from-bottom-4 relative w-full max-w-lg rounded-2xl border-0 bg-white shadow-2xl duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header avec gradient bleu */}
            <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6" />
                  <h2 className="text-xl font-bold">Remarque du responsable</h2>
                </div>
                <button
                  onClick={() => setShowRemarque(false)}
                  className="rounded-full p-2 transition-all duration-200 hover:rotate-90 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6">
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="whitespace-pre-line leading-relaxed text-blue-800">
                  {data?.remarqueResponsable}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <Button
                onClick={() => setShowRemarque(false)}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 py-2 font-medium text-white transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-indigo-800"
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
}
