// src/hooks/AuthProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface TokenPayload {
  sub: string;
  email: string;
  roles: string;
  nom?: string;
  prenom?: string;
  fonction?: string;
  direction?: string;
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: TokenPayload | null;
  isLoggedIn: boolean;
  login: (user: TokenPayload) => void; // ← now takes a user object
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<TokenPayload | null>(null);

  // On mount, try to fetch /auth/me in case a cookie already exists
  useEffect(() => {
    (async () => {
      const me = await fetch("http://localhost:2000/auth/me", {
        credentials: "include",
      });
      if (me.ok) {
        setUser(await me.json());
      }
    })();
  }, []);

  const login = (user: TokenPayload) => {
    setUser(user);
  };

  const logout = () => {
    fetch("http://localhost:2000/auth/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => {
      setUser(null);
      window.location.href = "/";
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
