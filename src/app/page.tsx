"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, initialized, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Redirect immediately if already authenticated
  useEffect(() => {
    if (initialized && isLoggedIn) {
      router.replace("/acceuil");
    }
  }, [initialized, isLoggedIn, router]);

  // Don’t render the login form until we know auth state
  if (!initialized || isLoggedIn) {
    return null;
  }

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
      const { message } = await res.json();
      return setError(message || "Login failed");
    }

    const me = await fetch("http://localhost:2000/auth/me", {
      credentials: "include",
    });
    if (!me.ok) {
      return setError("Could not fetch user");
    }
    const user = await me.json();
    login(user);
    router.push("/acceuil");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-80 rounded bg-white p-8 shadow-md"
      >
        <h2 className="mb-6 text-center text-2xl font-bold">Login</h2>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <label className="mb-4 block">
          <span>Email</span>
          <input
            type="email"
            className="w-full rounded border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="mb-6 block">
          <span>Password</span>
          <input
            type="password"
            className="w-full rounded border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button
          type="submit"
          className="w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}
