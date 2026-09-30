import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * Este componente configura o HTML raiz para a exportação web estática e de desenvolvimento.
 * Injeta preconnects e as folhas de estilo do Google Fonts (Rajdhani, Inter, JetBrains Mono)
 * diretamente no <head> da página inicial para carregamento instantâneo.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#0E0F12" />

        {/* Preconnect para acelerar o download das fontes */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Google Fonts: Rajdhani (Headings gamer/TCG), Inter (UI/Textos) e JetBrains Mono (IDs técnicos) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&family=Rajdhani:wght@500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Reseta estilos do ScrollView nativo do React Native Web */}
        <ScrollViewStyleReset />

        {/* Fundo escuro pré-carregado para evitar flash branco */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body {
                background-color: #0E0F12;
                color: #F5F6F8;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
