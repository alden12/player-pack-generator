import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import pkg from "./package.json";

// https://vitejs.dev/config/
// base matches the GitHub Pages project sub-path (see "homepage" in package.json).
export default defineConfig({
  base: "/player-pack-generator/",
  plugins: [react(), tailwindcss()],
  // Expose the version to the app (shown in the footer). The deploy workflow
  // sets APP_VERSION (major.minor from package.json + the run number); local
  // builds fall back to the package.json version.
  define: {
    __APP_VERSION__: JSON.stringify(process.env.APP_VERSION || pkg.version),
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    // Vitest runs the unit tests under src/; the e2e/ specs are Playwright's.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
