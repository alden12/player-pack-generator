import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import pkg from "./package.json";

// https://vitejs.dev/config/
// base matches the GitHub Pages project sub-path (see "homepage" in package.json).
export default defineConfig({
  base: "/player-pack-generator/",
  plugins: [react()],
  // Expose the package version to the app (shown in the footer). The deploy
  // workflow bumps the patch version before building.
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
