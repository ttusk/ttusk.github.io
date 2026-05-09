// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
// import icon from "astro-icon";
import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  fonts: [{
    provider: fontProviders.local(),
    name: "JetBrains Mono",
    cssVariable: "--font-jetbrains-mono",
    fallbacks: ["monospace"],
    options: {
      variants: [
        {
          src: ["./src/assets/fonts/jetbrains-mono-latin-400-normal.woff2"],
          weight: 400,
          style: "normal",
        },
        {
          src: ["./src/assets/fonts/jetbrains-mono-latin-400-italic.woff2"],
          weight: 400,
          style: "italic",
        },
        {
          src: ["./src/assets/fonts/jetbrains-mono-latin-500-normal.woff2"],
          weight: 500,
          style: "normal",
        },
        {
          src: ["./src/assets/fonts/jetbrains-mono-latin-700-normal.woff2"],
          weight: 700,
          style: "normal",
        },
      ],
    },
  }],

  integrations: [expressiveCode({
    themes: ['solarized-light'],
    styleOverrides: {
      // codeFontFamily: 'Maple Mono NF CN',
      borderRadius: '0',
      frames: {
        shadowColor: 'transparent',
      },
    }
  })],

  site: "https://talkinghead.blog.br",
});
