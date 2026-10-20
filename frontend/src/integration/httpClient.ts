import axios from "axios";

// URL base apontando para o Gateway (porta 8080 no navegador Web)
export const API_BASE_URL = process.env.EXPO_PUBLIC_GATEWAY_URL || "http://localhost:8080";

// Instância do Axios com suporte nativo a Cookies HttpOnly (withCredentials)
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  withCredentials: true,
});

httpClient.interceptors.request.use((config) => {
  config.withCredentials = true;
  return config;
});
