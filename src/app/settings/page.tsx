"use client";

import React, { useState, useEffect, useRef } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

interface UserData {
  nom: string;
  prenom: string;
  email: string;
}

export default function SettingsPage() {
  const [data, setData] = useState<UserData>({
    nom: "",
    prenom: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Email-modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [emailModalMsg, setEmailModalMsg] = useState<string | null>(null);

  // Password-modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [resetStep, setResetStep] = useState<"request" | "verify" | "change">(
    "request",
  );
  const [resetCode, setResetCode] = useState("");
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [pwModalMsg, setPwModalMsg] = useState<string | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Fetch current user
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:2000/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          setData({ nom: json.nom, prenom: json.prenom, email: json.email });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Countdown for reset code expiry
  useEffect(() => {
    if (expiresAt) {
      const tick = () => {
        const diff = Math.max(
          0,
          Math.floor((expiresAt.getTime() - Date.now()) / 1000),
        );
        setTimeLeft(diff);
        if (diff <= 0 && countdownRef.current)
          clearInterval(countdownRef.current);
      };
      tick();
      countdownRef.current = setInterval(tick, 1000);
    }
    return () => countdownRef.current && clearInterval(countdownRef.current);
  }, [expiresAt]);

  if (loading) return <DefaultLayout>Chargement…</DefaultLayout>;

  // ========== Profile fields (nom, prenom) ==========
  const saveField = async (field: keyof UserData, value: string) => {
    setMessage(null);
    const res = await fetch("http://localhost:2000/users/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ [field]: value }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setMessage("Erreur : " + (err.message || res.statusText));
      return false;
    }
    setData((prev) => ({ ...prev, [field]: value }));
    setMessage("Mise à jour réussie !");
    return true; // stay in edit mode until user cancels
  };

  // ========== Email change ==========
  const openEmailModal = () => {
    setNewEmail(data.email);
    setCurrentPassword("");
    setEmailModalMsg(null);
    setShowEmailModal(true);
  };
  const sendEmailChange = async () => {
    setEmailModalMsg(null);
    const res = await fetch("http://localhost:2000/users/me/email", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ newEmail, currentPassword }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      setEmailModalMsg(payload.message || res.statusText);
      return;
    }
    setData((d) => ({ ...d, email: newEmail }));
    setMessage("Email mis à jour !");
    setShowEmailModal(false);
  };

  // ========== Password reset flow ==========
  const openPasswordModal = () => {
    setResetStep("request");
    setPwModalMsg(null);
    setShowPasswordModal(true);
  };
  const requestCode = async () => {
    // clear message only on resend
    if (resetStep === "verify") setPwModalMsg(null);
    const res = await fetch(
      "http://localhost:2000/users/me/password/request-code",
      {
        method: "POST",
        credentials: "include",
      },
    );
    if (!res.ok) {
      setPwModalMsg("Impossible de générer le code");
      return;
    }
    const json = await res.json();
    setExpiresAt(new Date(json.expiresAt));
    if (resetStep === "request") {
      setResetStep("verify");
    } else {
      setPwModalMsg("Nouveau code envoyé");
      setResetStep("verify");
    }
  };
  const verifyCode = async () => {
    setPwModalMsg(null);
    const res = await fetch(
      "http://localhost:2000/users/me/password/verify-code",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: resetCode }),
      },
    );
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPwModalMsg(payload.message || "Code invalide ou expiré.");
      return;
    }
    setResetStep("change");
  };
  const savePassword = async () => {
    setPwModalMsg(null);
    if (passwords.password !== passwords.confirmPassword) {
      setPwModalMsg("Les mots de passe ne correspondent pas.");
      return;
    }
    const res = await fetch("http://localhost:2000/users/me/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        newPassword: passwords.password,
        confirmPassword: passwords.confirmPassword,
      }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPwModalMsg(payload.message || "Erreur mot de passe");
      return;
    }
    setMessage("Mot de passe mis à jour !");
    setShowPasswordModal(false);
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg space-y-12">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900">
              Paramètres du compte
            </h1>
            <p className="mt-2 text-gray-600">
              Gérez votre profil, votre email et votre mot de passe
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
              <p className="text-sm text-green-700">{message}</p>
            </div>
          )}

          {/* Profil actuel */}
          <section className="rounded-xl bg-white shadow-md">
            <div className="border-l-4 border-blue-500 p-6">
              <h2 className="mb-2 text-lg font-semibold text-gray-800">
                Profil actuel
              </h2>
              <p className="text-2xl font-bold text-gray-900">
                {data.prenom} {data.nom}
              </p>
              <p className="text-gray-500">{data.email}</p>
            </div>
          </section>

          {/* Édition du profil */}
          <section className="space-y-8">
            <div className="divide-y divide-gray-100 rounded-xl bg-white shadow-md">
              {/* Nom & Prénom */}
              <div className="space-y-6 p-6">
                {(["nom", "prenom"] as (keyof UserData)[]).map((field) => (
                  <EditableField
                    key={field}
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={data[field]}
                    onSave={(val) => saveField(field, val)}
                  />
                ))}
              </div>
              {/* Email */}
              <div className="flex items-center justify-between border-t p-6">
                <div>
                  <p className="text-sm font-medium uppercase text-gray-500">
                    Email
                  </p>
                  <p className="mt-1 text-lg text-gray-800">{data.email}</p>
                </div>
                <button
                  onClick={openEmailModal}
                  className="rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 font-medium text-white transition hover:opacity-90"
                >
                  Modifier
                </button>
              </div>
            </div>

            {/* Mot de passe */}
            <div className="flex items-center justify-between rounded-xl bg-white p-6 shadow-md">
              <div>
                <p className="text-sm font-medium uppercase text-gray-500">
                  Mot de passe
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Sécurisez votre compte.
                </p>
              </div>
              <button
                onClick={openPasswordModal}
                className="rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 font-medium text-white transition hover:opacity-90"
              >
                Changer
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Modals */}
      {showEmailModal && (
        <Modal title="Changer l’email" onClose={() => setShowEmailModal(false)}>
          {emailModalMsg && (
            <p className="mb-4 text-sm text-red-600">{emailModalMsg}</p>
          )}
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Nouvel email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <input
              type="password"
              placeholder="Mot de passe actuel"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={sendEmailChange}
                className="rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2 font-medium text-white transition hover:opacity-90"
              >
                Confirmer
              </button>
              <button
                onClick={() => setShowEmailModal(false)}
                className="rounded-md bg-gray-200 px-5 py-2 transition hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showPasswordModal && (
        <Modal
          title="Changer le mot de passe"
          onClose={() => setShowPasswordModal(false)}
        >
          {pwModalMsg && (
            <p className="mb-4 text-sm text-red-600">{pwModalMsg}</p>
          )}

          {resetStep === "request" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Un code de vérification sera envoyé à votre email.
              </p>
              <button
                onClick={requestCode}
                className="w-full rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2 font-medium text-white transition hover:opacity-90"
              >
                Envoyer le code
              </button>
            </div>
          )}

          {resetStep === "verify" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Code envoyé. Expire dans{" "}
                <span className="font-mono">
                  {Math.floor(timeLeft / 60)}:
                  {String(timeLeft % 60).padStart(2, "0")}
                </span>
              </p>
              <input
                type="text"
                placeholder="Entrez le code"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={verifyCode}
                  className="rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2 font-medium text-white transition hover:opacity-90"
                >
                  Vérifier
                </button>
                <button
                  onClick={requestCode}
                  className="rounded-md bg-gray-200 px-5 py-2 transition hover:bg-gray-300"
                >
                  Renvoyer
                </button>
              </div>
            </div>
          )}

          {resetStep === "change" && (
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                value={passwords.password}
                onChange={(e) =>
                  setPasswords((ps) => ({ ...ps, password: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <input
                type="password"
                placeholder="Confirmer mot de passe"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords((ps) => ({
                    ...ps,
                    confirmPassword: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <div className="flex justify-end">
                <button
                  onClick={savePassword}
                  className="rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2 font-medium text-white transition hover:opacity-90"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </DefaultLayout>
  );
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

function EditableField({
  label,
  value,
  onSave,
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(value);

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm uppercase text-gray-500">{label}</div>
        {editing ? (
          <input
            type="text"
            value={v}
            onChange={(e) => setV(e.target.value)}
            className="mt-1 w-64 rounded-lg border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        ) : (
          <div className="mt-1 w-64 truncate text-lg text-gray-700">
            {value}
          </div>
        )}
      </div>
      <div>
        {editing ? (
          <>
            <button
              onClick={() => onSave(v)}
              className="mr-2 rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
            >
              Sauvegarder
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded bg-gray-300 px-3 py-1 hover:bg-gray-400"
            >
              Annuler
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="rounded bg-blue-100 px-3 py-1 text-blue-600 hover:bg-blue-200"
          >
            Modifier
          </button>
        )}
      </div>
    </div>
  );
}

function ActionRow({
  label,
  value,
  actionLabel,
  onAction,
}: {
  label: string;
  value: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm uppercase text-gray-500">{label}</div>
        <div className="mt-1 w-64 truncate text-lg text-gray-700">{value}</div>
      </div>
      <button
        onClick={onAction}
        className="rounded-lg bg-blue-100 px-4 py-1 text-blue-600 hover:bg-blue-200"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
