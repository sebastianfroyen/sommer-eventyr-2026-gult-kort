import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

const isUsingVercel = process.env.VERCEL === "1";

if (!isUsingVercel) {
  console.log(
    "\x1b[33m",
    "OBS! Applikasjonen kjører uten Vercel miljø aktivert. Brukernavnsjekk og API-kall vil ikke fungere",
    "\x1b[0m"
  );
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
