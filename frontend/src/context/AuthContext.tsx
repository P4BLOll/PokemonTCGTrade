import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { api } from "@/services/api";

interface DecodedToken {
  sub: string;
  roles?: string[];
  exp?: number;
}

interface AuthContextType {
  user: string | null;
  token: string | null;
  roles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signUp: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("@Auth:token");
      const storedUser = await AsyncStorage.getItem("@Auth:user");
      const storedRoles = await AsyncStorage.getItem("@Auth:roles");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        if (storedRoles) {
          setRoles(JSON.parse(storedRoles));
        }
      }
    } catch (e) {
      console.error("Erro ao recuperar sessao:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const cleanUser = username.trim().toLowerCase();
      // Chama o Gateway -> lb://login (/auth/service/auth)
      const res = await api.post("/auth/service/auth", {
        username: cleanUser,
        password: password,
      });

      const tokenValue = res.data.token;
      if (!tokenValue) {
        return { success: false, message: "Token nao retornado pelo servidor." };
      }

      let userRoles: string[] = ["ROLE_USER"];
      try {
        const decoded = jwtDecode<DecodedToken>(tokenValue);
        if (decoded.roles && Array.isArray(decoded.roles)) {
          userRoles = decoded.roles;
        }
      } catch (decodeErr) {
        console.warn("Nao foi possivel decodificar roles do JWT:", decodeErr);
      }

      setToken(tokenValue);
      setUser(cleanUser);
      setRoles(userRoles);
      api.defaults.headers.common["Authorization"] = `Bearer ${tokenValue}`;

      await AsyncStorage.setItem("@Auth:token", tokenValue);
      await AsyncStorage.setItem("@Auth:user", cleanUser);
      await AsyncStorage.setItem("@Auth:roles", JSON.stringify(userRoles));

      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Usuario ou senha invalidos";
      return { success: false, message: msg };
    }
  };

  const signUp = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const cleanUser = username.trim().toLowerCase();
      // Chama o Gateway -> lb://login (/login/user/cadastrar)
      await api.post("/login/user/cadastrar", {
        username: cleanUser,
        password: password,
        roles: ["USER"]
      });
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Falha ao registrar treinador";
      return { success: false, message: msg };
    }
  };

  const signOut = async () => {
    setUser(null);
    setToken(null);
    setRoles([]);
    delete api.defaults.headers.common["Authorization"];
    await AsyncStorage.removeItem("@Auth:token");
    await AsyncStorage.removeItem("@Auth:user");
    await AsyncStorage.removeItem("@Auth:roles");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        roles,
        isAuthenticated: !!token && !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);