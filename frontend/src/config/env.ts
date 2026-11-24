// Resolução centralizada das URLs das APIs de backend via variáveis de ambiente (sem hardcode no código).
// Em produção (Vercel / GitHub Actions), os valores são injetados via Secrets (URL_GATEWAY, URL_LOGIN, etc.).
// Em desenvolvimento local, defina os valores no arquivo frontend/.env (baseado em frontend/.env.example).

const sanitizeUrl = (value?: string): string => {
  if (!value) return "";
  return value.trim().replace(/\/+$/, "");
};

const gatewayUrl = sanitizeUrl(process.env.EXPO_PUBLIC_GATEWAY_URL);
const loginUrl = sanitizeUrl(process.env.EXPO_PUBLIC_LOGIN_URL) || gatewayUrl;
const cadastroUrl = sanitizeUrl(process.env.EXPO_PUBLIC_CADASTRO_URL) || loginUrl;
const despachoUrl = sanitizeUrl(process.env.EXPO_PUBLIC_DESPACHO_URL) || gatewayUrl;
const estoqueUrl = sanitizeUrl(process.env.EXPO_PUBLIC_ESTOQUE_URL) || gatewayUrl;
const relatorioUrl = sanitizeUrl(process.env.EXPO_PUBLIC_RELATORIO_URL) || gatewayUrl;

export const API_URLS = {
  gateway: gatewayUrl,
  login: loginUrl,
  cadastro: cadastroUrl,
  despacho: despachoUrl,
  estoque: estoqueUrl,
  relatorio: relatorioUrl,
} as const;
