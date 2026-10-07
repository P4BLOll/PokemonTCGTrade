// Decodifica o payload JSON que vem dentro da string do token JWT
export function parseJwt(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    
    // Suporte universal para ambiente Web e React Native
    if (typeof atob === "function") {
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    }
    return null;
  } catch (error) {
    console.error("Erro ao decodificar token JWT:", error);
    return null;
  }
}

// Checa se o token JWT já passou da hora de expiração
export function isTokenExpired(token: string): boolean {
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return true;
  return Date.now() >= decoded.exp * 1000;
}

