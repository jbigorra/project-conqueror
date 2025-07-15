import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "behave",
          include: ["packages/behave/tests/**/*.test.ts"],
        },
      },
    ],
  },
});
