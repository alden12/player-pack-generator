import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
// base matches the GitHub Pages project sub-path (see "homepage" in package.json).
export default defineConfig({
  base: "/player-pack-generator/",
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
