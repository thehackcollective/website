import stylex from "@stylexjs/unplugin";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    stylex.vite({
      dev: mode === "development",
      useCSSLayers: true,
      unstable_moduleResolution: {
        type: "commonJS",
        rootDir: path.resolve(__dirname),
      },
      aliases: {
        "@/*": path.resolve(__dirname, "src/*"),
      },
      cssInjectionTarget: (fileName: string) =>
        fileName.startsWith("assets/index-") && fileName.endsWith(".css"),
    }),
  ],
  clearScreen: false,
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "./src") }],
  },
  build: {
    target: "es2022",
  },
}));
