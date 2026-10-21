import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Electron loads the bundled fallback over file://, which needs relative asset paths.
  // The hosted web build keeps absolute paths so deep routes resolve correctly.
  base: mode === "electron" ? "./" : "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    // No COEP/COOP here — they break embedded previews (Sandpack, iframes) unless every child frame sends matching headers.
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
