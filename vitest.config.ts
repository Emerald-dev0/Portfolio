import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * Node-environment tests. The project has no headless browser available, so
 * everything under test is the data layer and the pure conversion code, which
 * is where the logic that can actually be wrong lives.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    globals: false,
    pool: "forks",
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // `server-only` throws outside an RSC by design; tests stub it out.
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
});
