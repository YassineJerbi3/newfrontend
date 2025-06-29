import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface Equipement {
  id: string;
  designation: string;
  equipmentType: string;
  numeroSerie: string;
}

export interface IncidentModalProps {
  selected: Equipement | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // callback after successful submit
}

const IncidentModal: React.FC<IncidentModalProps> = ({
  selected,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [priorite, setPriorite] = useState<"URGENT" | "NORMALE" | "BASSE">(
    "NORMALE",
  );
  const [etatEquipement, setEtatEquipement] = useState<"EN_MARCHE" | "ARRET">(
    "EN_MARCHE",
  );
  const [description, setDescription] = useState("");
  const [echeance, setEcheance] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [echeanceError, setEcheanceError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setPriorite("NORMALE");
      setEtatEquipement("EN_MARCHE");
      setDescription("");
      setEcheance("");
      setFiles([]);
      setEcheanceError("");
      setSubmitError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setEcheanceError("");

    if (!echeance) {
      setEcheanceError("Ce champ est obligatoire.");
      return;
    }

    const echeanceDate = new Date(echeance);
    echeanceDate.setHours(0, 0, 0, 0);
    const minDays = priorite === "URGENT" ? 3 : priorite === "NORMALE" ? 5 : 8;
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + minDays);
    minDate.setHours(0, 0, 0, 0);

    if (echeanceDate < minDate) {
      setEcheanceError(
        `La date d’échéance doit être au minimum ${minDays} jour(s) après aujourd’hui.`,
      );
      return;
    }

    if (!selected) return;

    const payload = new FormData();
    payload.append("equipementId", selected.id);
    payload.append("priorite", priorite);
    payload.append("etatEquipement", etatEquipement);
    payload.append("description", description);
    payload.append("typeObject", selected.equipmentType);
    payload.append("echeance", echeance);
    files.forEach((f) => payload.append("pieceJointe", f));

    setLoading(true);
    try {
      const res = await fetch("http://localhost:2000/incidents", {
        method: "POST",
        credentials: "include",
        body: payload,
      });
      const body = await res.json();
      if (!res.ok) {
        setSubmitError(body.message || `Erreur ${res.status}`);
      } else {
        onClose();
        onSuccess && onSuccess();
      }
    } catch (err: any) {
      setSubmitError("Erreur réseau, réessayez plus tard");
    } finally {
      setLoading(false);
    }
  };

  if (!selected) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black bg-opacity-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="mb-4 text-2xl font-semibold">
              Déclarer une intervention pour{" "}
              <span className="font-medium">{selected.designation}</span>
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block font-medium">Priorité</label>
                <select
                  value={priorite}
                  onChange={(e) => setPriorite(e.target.value as any)}
                  required
                  className="w-full rounded border px-3 py-2"
                >
                  <option value="URGENT">Urgent</option>
                  <option value="NORMALE">Normale</option>
                  <option value="BASSE">Basse</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  État de l’équipement
                </label>
                <select
                  value={etatEquipement}
                  onChange={(e) => setEtatEquipement(e.target.value as any)}
                  required
                  className="w-full rounded border px-3 py-2"
                >
                  <option value="EN_MARCHE">En marche</option>
                  <option value="ARRET">Arrêt</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                  className="w-full rounded border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  Pièces jointes (optionnel)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">Échéance</label>
                <input
                  type="date"
                  value={echeance}
                  onChange={(e) => setEcheance(e.target.value)}
                  required
                  className={`w-full rounded border px-3 py-2 ${echeanceError ? "border-red-500" : ""}`}
                />
                {echeanceError && (
                  <p className="mt-1 text-sm text-red-600">{echeanceError}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded border px-4 py-2 hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? "Envoi..." : "Envoyer"}
                </button>
              </div>

              {submitError && (
                <p className="mt-2 text-sm text-red-600">{submitError}</p>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IncidentModal;
