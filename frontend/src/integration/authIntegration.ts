import { loginHttpClient, cadastroHttpClient } from "./httpClient";

// Comunicação do frontend com os endpoints de autenticação e cadastro (URLs via variáveis de ambiente)
export const authIntegration = {
  // Chama POST /auth/login passando credenciais e recebe o cookie seguro HttpOnly
  login: async (username: string, password: string) => {
    const res = await loginHttpClient.post("/auth/login", { username, password });
    return res.data;
  },
  // Chama POST /login/user/cadastrar para cadastrar um novo piloto/oficial
  register: async (username: string, password: string, email?: string) => {
    const res = await cadastroHttpClient.post("/login/user/cadastrar", { username, password, email });
    return res.data;
  },
};
