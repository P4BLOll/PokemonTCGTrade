import { httpClient } from "./httpClient";

// Comunicação do frontend com os endpoints de autenticação via Gateway
export const authIntegration = {
  // Chama POST /auth/login passando credenciais e recebe o token JWT
  login: async (username: string, password: string) => {
    const res = await httpClient.post("/auth/login", { username, password });
    return res.data;
  },
  // Chama POST /auth/register para cadastrar um novo piloto/oficial
  register: async (username: string, password: string, email?: string) => {
    const res = await httpClient.post("/auth/register", { username, password, email });
    return res.data;
  },
};

