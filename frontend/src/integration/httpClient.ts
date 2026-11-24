import axios, { AxiosInstance } from "axios";
import { API_URLS } from "../config/env";

// URL base padrão (resolvida exclusivamente por variável de ambiente, sem hardcode)
export const API_BASE_URL = API_URLS.gateway;

export const createHttpClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 30000, // 30s para suportar cold-start de serviços gratuitos no Render
    withCredentials: true, // OBRIGATÓRIO: Permite que o navegador envie e receba Cookies seguros HttpOnly
  });

  client.interceptors.request.use((config) => {
    config.withCredentials = true;
    return config;
  });

  return client;
};

// Clientes dedicados por microsserviço (cada um lê sua variável de ambiente EXPO_PUBLIC_* com fallback para o Gateway)
export const httpClient = createHttpClient(API_URLS.gateway);
export const loginHttpClient = createHttpClient(API_URLS.login);
export const cadastroHttpClient = createHttpClient(API_URLS.cadastro);
export const despachoHttpClient = createHttpClient(API_URLS.despacho);
export const estoqueHttpClient = createHttpClient(API_URLS.estoque);
export const relatorioHttpClient = createHttpClient(API_URLS.relatorio);
