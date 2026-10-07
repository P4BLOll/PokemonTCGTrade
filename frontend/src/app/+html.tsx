import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';
import { CSS_DESIGN_TOKENS } from '@/constants/Tokens';

/**
 * AERO-OS // MONOCHROME AMBER KERNEL TERMINAL
 * Root HTML configuration para Web / Desktop.
 * Injeta preconnects, Google Fonts (VT323 terminal bitmap, JetBrains Mono telemetria)
 * e o subsistema visual de monitor CRT Âmbar com scanlines, flicker catódico e alto contraste WCAG AA.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#050200" />
        <title>AERO-OS // AMBER KERNEL TERMINAL v5.0</title>

        {/* Preconnect para acelerar o download das fontes de terminal */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Fontes Monoespaçadas e Bitmap CRT com display=swap */}
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=VT323&display=swap"
          rel="stylesheet"
        />

        {/* Reseta estilos do ScrollView do React Native Web */}
        <ScrollViewStyleReset />

        {/* Injeção global de tokens CSS, Scanlines e Flicker do Tubo CRT */}
        <style
          dangerouslySetInnerHTML={{
            __html: CSS_DESIGN_TOKENS,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
