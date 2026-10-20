import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/services/api";

interface AuthContextType {
  user: string | null;
  token: string | null; // Oculto por segurança (armazenado exclusivamente em Cookie HttpOnly no navegador)
  roles: string[];
  isAdmin: boolean;
  isUser: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signUp: (username: string, password: string, roles?: string[]) => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  token: null,
  roles: [],
  isAdmin: false,
  isUser: false,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => ({ success: false, message: "Módulo de autenticação não inicializado" }),
  signUp: async () => ({ success: false, message: "Módulo de autenticação não inicializado" }),
  signOut: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  /**
   * Restaura a sessão do oficial a partir do Cookie seguro HttpOnly ("AUTH_SESSION").
   * O navegador envia o cookie automaticamente via withCredentials: true.
   * O token JWT nunca trafega pelo JavaScript do navegador nem aparece no localStorage.
   */
  const loadStoredSession = async () => {
    try {
      // 1. Tenta validar a sessão ativa pelo Cookie seguro HttpOnly
      const res = await api.get("/auth/me");
      if (res.data && res.data.authenticated && res.data.username) {
        setUser(res.data.username);
        setRoles(Array.isArray(res.data.roles) && res.data.roles.length > 0 ? res.data.roles : ["ROLE_USER"]);
        setIsLoading(false);
        return;
      }
    } catch {
      // Cookie ausente ou expirado no navegador
    }

    // 2. Se o backend estiver temporariamente offline ou a sessão expirou, limpa o estado
    setUser(null);
    setRoles([]);
    setIsLoading(false);
  };

  /**
   * Faz login através do Gateway.
   * O servidor responde com header Set-Cookie HttpOnly ("AUTH_SESSION") com validade de 24h.
   * O token JWT NÃO aparece no corpo da resposta e NÃO é armazenado no localStorage.
   */
  const signIn = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const cleanUser = username.trim().toLowerCase();
      const res = await api.post("/auth/service/auth", {
        username: cleanUser,
        password: password,
      });

      // Extrai os dados do oficial retornados com segurança sem o token
      const userRoles: string[] = Array.isArray(res.data.roles) && res.data.roles.length > 0
        ? res.data.roles
        : ["ROLE_USER"];

      setUser(cleanUser);
      setRoles(userRoles);

      // Salva apenas identificadores públicos de interface (sem nenhum token)
      await AsyncStorage.setItem("@Auth:user", cleanUser);
      await AsyncStorage.setItem("@Auth:roles", JSON.stringify(userRoles));

      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Usuário ou senha inválidos";
      return { success: false, message: msg };
    }
  };

  /**
   * Cadastra um novo oficial ou administrador no MongoDB
   */
  const signUp = async (username: string, password: string, rolesToAssign?: string[]): Promise<{ success: boolean; message?: string }> => {
    try {
      const cleanUser = username.trim().toLowerCase();
      const payloadRoles = rolesToAssign && rolesToAssign.length > 0 ? rolesToAssign : ["USER"];
      await api.post("/login/user/cadastrar", {
        username: cleanUser,
        password: password,
        roles: payloadRoles,
      });
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Falha ao registrar oficial de frota";
      return { success: false, message: msg };
    }
  };

  /**
   * Encerra a sessão: notifica o servidor para revogar o Cookie HttpOnly (Max-Age=0)
   * e reseta o estado local.
   */
  const signOut = async () => {
    try {
      await api.post("/auth/logout").catch(() => null);
    } catch {
      // Ignora erro de rede no logout
    }
    setUser(null);
    setRoles([]);
    delete api.defaults.headers.common["Authorization"];
    await AsyncStorage.removeItem("@Auth:token");
    await AsyncStorage.removeItem("@Auth:user");
    await AsyncStorage.removeItem("@Auth:roles");
  };

  const isAdmin = roles.some((r) => r.toUpperCase().includes("ADMIN"));
  const isUser = !isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token: null, // Token não aparece no navegador (protegido exclusivamente em Cookie HttpOnly)
        roles,
        isAdmin,
        isUser,
        isAuthenticated: !!user,
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