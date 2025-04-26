"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface TokenPayload {
  id: string;
  email: string;
  roles: string[];
  // …etc
}

interface AuthContextType {
  user: TokenPayload | null;
  isLoggedIn: boolean;
  initialized: boolean;
  login: (user: TokenPayload) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  initialized: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<TokenPayload | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("http://localhost:2000/auth/me", {
        credentials: "include",
      });
      if (res.ok) {
        setUser(await res.json());
      }
      setInitialized(true);
    })();
  }, []);

  const login = (u: TokenPayload) => setUser(u);
  const logout = () => {
    fetch("http://localhost:2000/auth/logout", {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      setUser(null);
      window.location.href = "/";
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        initialized,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
