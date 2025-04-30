"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, initialized, login } = useAuth();

  // login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // forgot-password modal state
  const [showForgot, setShowForgot] = useState(false);
  const [fpStep, setFpStep] = useState<"request" | "verify" | "reset">(
    "request",
  );
  const [fpEmail, setFpEmail] = useState("");
  const [fpCode, setFpCode] = useState("");
  const [fpNew, setFpNew] = useState("");
  const [fpConfirm, setFpConfirm] = useState("");
  const [fpMsg, setFpMsg] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<number>();

  // countdown effect
  useEffect(() => {
    if (expiresAt) {
      const tick = () => {
        const diff = Math.max(
          0,
          Math.floor((expiresAt.getTime() - Date.now()) / 1000),
        );
        setTimeLeft(diff);
      };
      tick();
      timerRef.current = window.setInterval(tick, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [expiresAt]);

  // redirect if already logged
  useEffect(() => {
    if (initialized && isLoggedIn) router.replace("/acceuil");
  }, [initialized, isLoggedIn, router]);
  if (!initialized || isLoggedIn) return null;

  // ── LOGIN SUBMIT ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch("http://localhost:2000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      return setError(j.message || "Login failed");
    }
    const me = await fetch("http://localhost:2000/auth/me", {
      credentials: "include",
    });
    if (!me.ok) return setError("Could not fetch user");
    login(await me.json());
    router.push("/acceuil");
  };

  // ── FORGOT PASSWORD HANDLERS ───────────────────────────────────────────────
  const requestCode = async () => {
    setFpMsg(null);
    if (!fpEmail) return setFpMsg("Veuillez entrer votre email.");
    const res = await fetch("http://localhost:2000/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fpEmail }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      return setFpMsg(j.message || "Email introuvable");
    }
    const j = await res.json();
    setExpiresAt(new Date(j.expiresAt));
    setFpStep("verify");
  };

  const verifyCode = async () => {
    setFpMsg(null);
    const res = await fetch(
      "http://localhost:2000/auth/forgot-password/verify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail, code: fpCode }),
      },
    );
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      return setFpMsg(j.message || "Code invalide/expiré");
    }
    setFpStep("reset");
  };

  const resetPassword = async () => {
    setFpMsg(null);
    if (fpNew !== fpConfirm)
      return setFpMsg("Les mots de passe ne correspondent pas.");

    const res = await fetch(
      "http://localhost:2000/auth/forgot-password/reset",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fpEmail,
          code: fpCode,
          newPassword: fpNew,
          confirmPassword: fpConfirm,
        }),
      },
    );
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      return setFpMsg(j.message || "Erreur");
    }

    // close the modal on success:
    setShowForgot(false);

    // optionally reset step and show a toast or message on the login page
    setFpMsg("Mot de passe réinitialisé. Vous pouvez vous reconnecter.");
    setFpStep("request");
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <form
          onSubmit={handleSubmit}
          className="w-80 space-y-4 rounded bg-white p-6 shadow-md"
        >
          <h2 className="text-center text-2xl font-bold text-blue-600">
            Se connecter
          </h2>
          {error && <p className="text-red-600">{error}</p>}

          <div>
            <label className="block text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border px-3 py-2"
              required
            />
          </div>

          <div className="flex justify-end text-sm">
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-blue-600 hover:underline"
            >
              Mot de passe oublié ?
            </button>
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
          >
            Se connecter
          </button>
        </form>
      </div>

      {showForgot && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md space-y-4 rounded bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-blue-600">
                Mot de passe oublié
              </h3>
              <button
                onClick={() => setShowForgot(false)}
                className="text-gray-400"
              >
                &times;
              </button>
            </div>

            {fpStep === "request" && (
              <>
                <p>Entrez votre email pour recevoir un code :</p>
                <input
                  type="email"
                  value={fpEmail}
                  onChange={(e) => setFpEmail(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                  placeholder="Email"
                />
                <button
                  onClick={requestCode}
                  className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
                >
                  Envoyer le code
                </button>
              </>
            )}

            {fpStep === "verify" && (
              <>
                <p>
                  Code envoyé à {fpEmail}. Expire dans{" "}
                  {Math.floor(timeLeft / 60)}:
                  {String(timeLeft % 60).padStart(2, "0")}
                </p>
                <input
                  value={fpCode}
                  onChange={(e) => setFpCode(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                  placeholder="Code à 6 chiffres"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={verifyCode}
                    className="flex-1 rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
                  >
                    Vérifier
                  </button>
                  <button
                    onClick={requestCode}
                    className="flex-1 rounded bg-gray-200 py-2 hover:bg-gray-300"
                  >
                    Renvoyer
                  </button>
                </div>
              </>
            )}

            {fpStep === "reset" && (
              <>
                <p>Choisissez un nouveau mot de passe :</p>
                <input
                  type="password"
                  value={fpNew}
                  onChange={(e) => setFpNew(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                  placeholder="Nouveau mot de passe"
                />
                <input
                  type="password"
                  value={fpConfirm}
                  onChange={(e) => setFpConfirm(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                  placeholder="Confirmer mot de passe"
                />
                <button
                  onClick={resetPassword}
                  className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
                >
                  Réinitialiser
                </button>
              </>
            )}

            {fpMsg && <p className="text-red-600">{fpMsg}</p>}
          </div>
        </div>
      )}
    </>
  );
}
