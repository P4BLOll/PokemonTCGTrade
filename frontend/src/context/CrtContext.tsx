import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type CrtIntensity = "FULL" | "SUBTLE" | "OFF";

interface CrtContextType {
  intensity: CrtIntensity;
  mode: CrtIntensity;
  setIntensity: (mode: CrtIntensity) => void;
  setMode: (mode: CrtIntensity) => void;
  cycleIntensity: () => void;
  cycleMode: () => void;
}

// Chave pra guardar a escolha do usuário no storage do navegador
const STORAGE_KEY = "@aero_os_crt_intensity";

const CrtContext = createContext<CrtContextType>({
  intensity: "SUBTLE",
  mode: "SUBTLE",
  setIntensity: () => {},
  setMode: () => {},
  cycleIntensity: () => {},
  cycleMode: () => {},
});

// Provedor que espalha o efeito visual retrô de monitor CRT por todo o app
export const CrtProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [intensity, setIntensityState] = useState<CrtIntensity>("SUBTLE");

  // Ao abrir o app, recupera o último modo que o usuário escolheu
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "FULL" || stored === "SUBTLE" || stored === "OFF") {
        setIntensityState(stored);
      }
    }).catch(() => {});
  }, []);

  // Altera a intensidade do efeito e salva a preferência
  const setIntensity = (mode: CrtIntensity) => {
    setIntensityState(mode);
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {});
    applyWebCrtStyle(mode);
  };

  // Alterna em loop: suave -> forte -> desligado -> suave
  const cycleIntensity = () => {
    const next: Record<CrtIntensity, CrtIntensity> = {
      SUBTLE: "FULL",
      FULL: "OFF",
      OFF: "SUBTLE",
    };
    setIntensity(next[intensity]);
  };

  // Na web, injeta a classe CSS no body pra desenhar as linhas de fósforo verde/âmbar
  const applyWebCrtStyle = (mode: CrtIntensity) => {
    if (typeof document === "undefined") return;
    const body = document.body;
    body.classList.remove("crt-full", "crt-subtle", "crt-off");
    body.classList.add(`crt-${mode.toLowerCase()}`);
  };

  // Mantém a classe sincronizada sempre que mudar o modo
  useEffect(() => {
    applyWebCrtStyle(intensity);
  }, [intensity]);

  return (
    <CrtContext.Provider
      value={{
        intensity,
        mode: intensity,
        setIntensity,
        setMode: setIntensity,
        cycleIntensity,
        cycleMode: cycleIntensity,
      }}
    >
      {children}
    </CrtContext.Provider>
  );
};

// Hook fácil pra qualquer tela ligar ou desligar o filtro CRT
export const useCrt = () => useContext(CrtContext);
