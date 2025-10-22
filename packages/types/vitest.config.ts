import { defineConfig, defineProject } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    projects: [
      defineProject({
        test: {
          name: "default",
          include: ["tests/default/**/*.test-d.ts"],
          typecheck: {
            enabled: true,
            tsconfig: "tests/default/tsconfig.json",
          },
        },
      }),
      defineProject({
        test: {
          name: "required-field",
          include: ["tests/required-field/**/*.test-d.ts"],
          typecheck: {
            enabled: true,
            tsconfig: "tests/required-field/tsconfig.json",
          },
        },
      }),
      defineProject({
        test: {
          name: "optional-field",
          include: ["tests/optional-field/**/*.test-d.ts"],
          typecheck: {
            enabled: true,
            tsconfig: "tests/optional-field/tsconfig.json",
          },
        },
      }),
      defineProject({
        test: {
          name: "override",
          include: ["tests/override/**/*.test-d.ts"],
          typecheck: {
            enabled: true,
            tsconfig: "tests/override/tsconfig.json",
          },
        },
      }),
    ],
  },
});
