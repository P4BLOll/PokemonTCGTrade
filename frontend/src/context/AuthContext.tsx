import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseJwt } from "@/utils/jwt";
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
  const [token, setToken] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  // Restaura o token e o usuário do storage pra não deslogar ao recarregar a tela
  const loadStoredSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("@Auth:token");
      const storedUser = await AsyncStorage.getItem("@Auth:user");
      const storedRoles = await AsyncStorage.getItem("@Auth:roles");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        // Já anexa o Bearer token no cabeçalho do Axios pra todas as requisições
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        if (storedRoles) {
          try {
            setRoles(JSON.parse(storedRoles));
          } catch {
            setRoles(["ROLE_USER"]);
          }
        }
      }
    } catch (e) {
      console.error("Erro ao recuperar sessao:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Faz login no Gateway, guarda o JWT e decodifica as permissões (roles)
  const signIn = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const cleanUser = username.trim().toLowerCase();
      // Bate no Gateway que repassa pro microsserviço de Auth
      const res = await api.post("/auth/service/auth", {
        username: cleanUser,
        password: password,
      });

      const tokenValue = res.data.token;
      if (!tokenValue) {
        return { success: false, message: "Token não retornado pelo servidor de autenticação." };
      }

      // Lê as roles diretamente da resposta ou de dentro do token JWT (ROLE_ADMIN, ROLE_USER)
      let userRoles: string[] = [];
      if (Array.isArray(res.data.roles) && res.data.roles.length > 0) {
        userRoles = res.data.roles;
      } else {
        try {
          const decoded = parseJwt(tokenValue);
          if (decoded && decoded.roles && Array.isArray(decoded.roles)) {
            userRoles = decoded.roles;
          }
        } catch (decodeErr) {
          console.warn("Não foi possível decodificar roles do JWT:", decodeErr);
        }
      }

      if (userRoles.length === 0) {
        userRoles = ["ROLE_USER"];
      }

      setToken(tokenValue);
      setUser(cleanUser);
      setRoles(userRoles);
      api.defaults.headers.common["Authorization"] = `Bearer ${tokenValue}`;

      // Salva no storage pra persistir a sessão do oficial
      await AsyncStorage.setItem("@Auth:token", tokenValue);
      await AsyncStorage.setItem("@Auth:user", cleanUser);
      await AsyncStorage.setItem("@Auth:roles", JSON.stringify(userRoles));

      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Usuário ou senha inválidos";
      return { success: false, message: msg };
    }
  };

  // Cadastra um novo oficial ou administrador no banco de dados MongoDB
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

  // Limpa o token, remove o header de autorização e desloga
  const signOut = async () => {
    setUser(null);
    setToken(null);
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
        token,
        roles,
        isAdmin,
        isUser,
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