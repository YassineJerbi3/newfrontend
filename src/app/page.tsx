"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/AuthProvider";
import Image from "next/image";

// Icons
const MailIcon = () => (
  <svg
    className="h-5 w-5 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z"
    />
  </svg>
);
const LockIcon = () => (
  <svg
    className="h-5 w-5 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 11c1.104 0 2 .896 2 2v2a2 2 0 11-4 0v-2c0-1.104.896-2 2-2zm6 0V9a6 6 0 10-12 0v2H4v10h16V11h-2z"
    />
  </svg>
);

const steps = ["request", "verify", "reset"] as const;
const stepLabels = ["Email", "Code", "Nouveau mot de passe"];

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, initialized, login } = useAuth();

  // ── Login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorField, setErrorField] = useState<
    "email" | "password" | "general" | null
  >(null);
  const [errorMsg, setErrorMsg] = useState("");

  // ── Forgot-password form
  const [showForgot, setShowForgot] = useState(false);
  const [fpStep, setFpStep] = useState<(typeof steps)[number]>("request");
  const [fpEmail, setFpEmail] = useState("");
  const [fpCode, setFpCode] = useState("");
  const [fpNew, setFpNew] = useState("");
  const [fpConfirm, setFpConfirm] = useState("");
  const [fpMsg, setFpMsg] = useState("");
  const [fpMsgType, setFpMsgType] = useState<"error" | "success">("error");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<number>();
  // 1) Ajoute une fonction pour reset tout le flow
  const resetForgotFlow = () => {
    setFpStep("request");
    setFpEmail("");
    setFpCode("");
    setFpNew("");
    setFpConfirm("");
    setFpMsg("");
    setFpMsgType("error");
    setExpiresAt(null);
    setTimeLeft(0);
  };

  // 2) Utilise-la à l’ouverture du modal
  const openForgot = () => {
    resetForgotFlow();
    setShowForgot(true);
  };

  // 3) Et aussi à la fermeture
  const closeForgot = () => {
    setShowForgot(false);
    resetForgotFlow();
  };
  // Redirect if logged in
  useEffect(() => {
    if (initialized && isLoggedIn) router.replace("/acceuil");
  }, [initialized, isLoggedIn, router]);

  // Countdown
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () =>
      setTimeLeft(
        Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000)),
      );
    tick();
    timerRef.current = window.setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [expiresAt]);

  if (!initialized || isLoggedIn) return null;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // Login submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Remise à zéro des erreurs
    setErrorField("general");
    setErrorMsg("");

    const res = await fetch("http://localhost:2000/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // Si échec, on affiche toujours le même message
    if (!res.ok) {
      const { message } = await res.json().catch(() => ({}) as any);
      setErrorMsg(
        message === "Compte désactivé"
          ? "Votre compte est désactivé — contactez le responsable SI"
          : "Échec de la connexion",
      );
      return;
    }

    // Si succès, on récupère le profil et on redirige
    const me = await fetch("http://localhost:2000/auth/me", {
      credentials: "include",
    });
    if (!me.ok) {
      setErrorMsg("Impossible de récupérer le profil");
      return;
    }

    login(await me.json());
    router.push("/acceuil");
  };

  // Send/Resend code
  const requestCode = async () => {
    setFpMsg("");
    setFpMsgType("error");
    if (!fpEmail) return setFpMsg("Email requis");
    const res = await fetch("http://localhost:2000/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fpEmail }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}) as any);
      // sur 400 BadRequestException, j.message === 'Compte non actif'
      switch (j.message) {
        case "Compte non actif":
          return setFpMsg(
            "Votre compte n'est pas actif — contactez le responsable SI",
          );
        default:
          return setFpMsg(j.message || "Email non trouvé");
      }
    }
    const j = await res.json();
    setExpiresAt(new Date(j.expiresAt));
    setFpStep("verify");
    if (fpStep === "verify") {
      setFpMsg("Code renvoyé !");
      setFpMsgType("success");
      setTimeout(() => setFpMsg(""), 10000);
    }
  };

  // Verify code
  const verifyCode = async () => {
    setFpMsg("");
    setFpMsgType("error");
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
      return setFpMsg(j.message || "Code invalide");
    }
    setFpStep("reset");
  };

  // Reset password
  const resetPassword = async () => {
    setFpMsg("");
    setFpMsgType("error");
    if (fpNew !== fpConfirm)
      return setFpMsg("Les mots de passe ne correspondent pas");
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
    setShowForgot(false);
    setFpStep("request");
    setFpMsg("Mot de passe réinitialisé");
    setFpMsgType("success");
    setTimeout(() => setFpMsg(""), 10000);
  };

  return (
    <>
      {/* Main login */}
      <div className="animate-fadeIn flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
        <div className="relative flex w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
          {/* Form */}
          <div className="w-full p-12 lg:w-1/2">
            <h1 className="mb-4 text-3xl font-extrabold text-blue-700">
              Gestion de Parc IT
            </h1>
            <p className="mb-8 text-gray-600">Connectez-vous pour continuer</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    <MailIcon />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@exemple.tn"
                    required
                    className={`w-full rounded-lg border py-3 pl-10 pr-4 ${
                      errorField === "email"
                        ? "border-red-500"
                        : "border-gray-300"
                    } shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                  />
                </div>
                {errorField === "email" && (
                  <p className="mt-1 text-sm text-red-600">{errorMsg}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    <LockIcon />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`w-full rounded-lg border py-3 pl-10 pr-4 ${
                      errorField === "password"
                        ? "border-red-500"
                        : "border-gray-300"
                    } shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                  />
                </div>
                {errorField === "password" && (
                  <p className="mt-1 text-sm text-red-600">{errorMsg}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="transform rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
                >
                  Se connecter
                </button>{" "}
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline"
                  onClick={openForgot} // <-- on utilise openForgot ici
                >
                  Mot de passe oublié ?
                </button>
              </div>
              {errorField === "general" && (
                <p className="mt-2 text-center text-sm text-red-600">
                  {errorMsg}
                </p>
              )}
            </form>
          </div>

          {/* Divider flush to image */}
          <div className="ml-auto hidden h-full w-px origin-top rotate-[15deg] bg-blue-800 lg:block" />

          {/* Image */}
          <div
            className="hidden w-1/2 overflow-hidden lg:block"
            style={{ clipPath: "polygon(15% 0,100% 0,100% 100%,0 100%)" }}
          >
            <Image
              src="/images/logo/istockphoto-1705582381-612x612.jpg"
              alt="IT Park"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover opacity-80 blur-sm filter"
              priority
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-6 text-sm text-gray-600">
          © {new Date().getFullYear()} Tous droits réservés
        </footer>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <div className="animate-scaleUp relative w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-2xl">
            <button
              onClick={closeForgot} // <-- et ici on utilise closeForgot
              className="absolute right-4 top-4 text-2xl text-gray-400 hover:text-gray-700"
            >
              &times;
            </button>
            <h3 className="text-center text-2xl font-semibold text-blue-700">
              Réinitialiser le mot de passe
            </h3>

            {fpMsg && (
              <div
                className={`rounded px-4 py-2 text-sm ${
                  fpMsgType === "error"
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
                } transition-opacity duration-500`}
              >
                {fpMsg}
              </div>
            )}

            {/* Enhanced stepper */}
            <div className="mb-6 px-6">
              <div className="relative">
                {/* Gradient track */}
                <div className="absolute inset-0 flex items-center">
                  <div className="h-1 w-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 shadow" />
                </div>
                {/* Circles */}
                <div className="relative z-10 flex justify-between">
                  {stepLabels.map((label, i) => {
                    const done = steps.indexOf(fpStep) > i;
                    const active = fpStep === steps[i];
                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center space-y-1"
                      >
                        <div
                          className={`
                            flex h-10 w-10 items-center justify-center rounded-full border-2 ring-2 ring-white transition
                            ${
                              done || active
                                ? "border-blue-600 bg-blue-600 text-white shadow-lg"
                                : "border-gray-300 bg-white text-gray-500"
                            }
                          `}
                        >
                          {i + 1}
                        </div>
                        <span
                          className={`text-sm font-medium transition ${
                            done || active ? "text-blue-600" : "text-gray-500"
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step content */}
            {fpStep === "request" && (
              <>
                <input
                  type="email"
                  value={fpEmail}
                  onChange={(e) => setFpEmail(e.target.value)}
                  placeholder="Votre email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                <button
                  onClick={requestCode}
                  className="w-full transform rounded-lg bg-blue-600 py-3 font-medium text-white shadow transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Envoyer le code
                </button>
              </>
            )}
            {fpStep === "verify" && (
              <>
                <input
                  type="text"
                  value={fpCode}
                  onChange={(e) => setFpCode(e.target.value)}
                  placeholder="Entrez le code"
                  className="mb-3 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-block rounded bg-gray-100 px-3 py-1 text-xs font-medium">
                    {formatTime(timeLeft)}
                  </span>
                  <button
                    onClick={requestCode}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Renvoyer le code
                  </button>
                </div>
                <button
                  onClick={verifyCode}
                  className="w-full transform rounded-lg bg-blue-600 py-3 font-medium text-white shadow transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Vérifier
                </button>
              </>
            )}
            {fpStep === "reset" && (
              <>
                <input
                  type="password"
                  value={fpNew}
                  onChange={(e) => setFpNew(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  className="mb-3 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                <input
                  type="password"
                  value={fpConfirm}
                  onChange={(e) => setFpConfirm(e.target.value)}
                  placeholder="Confirmer mot de passe"
                  className="mb-6 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                <button
                  onClick={resetPassword}
                  className="w-full transform rounded-lg bg-green-600 py-3 font-medium text-white shadow transition hover:-translate-y-0.5 hover:bg-green-700"
                >
                  Réinitialiser
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out both;
        }

        @keyframes scaleUp {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scaleUp {
          animation: scaleUp 0.3s ease-out both;
        }
      `}</style>
    </>
  );
}
