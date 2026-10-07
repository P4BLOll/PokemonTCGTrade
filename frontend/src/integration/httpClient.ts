import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// No emulador Android usa o IP 10.0.2.2 para acessar o localhost da máquina hospedeira
const getDefaultGatewayUrl = () => {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8080";
  }
  return "http://localhost:8080";
};

// URL base apontando para o Gateway (porta 8080)
export const API_BASE_URL = process.env.EXPO_PUBLIC_GATEWAY_URL || getDefaultGatewayUrl();

// Instância do Axios com timeout de 12 segundos
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
});

// Interceptor de requisições: anexa o token JWT automaticamente no cabeçalho Authorization
httpClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("@Auth:token");
    if (token) {
      if (config.headers.set) {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (e) {
    console.error("Erro ao carregar token no interceptor:", e);
  }
  return config;
});

