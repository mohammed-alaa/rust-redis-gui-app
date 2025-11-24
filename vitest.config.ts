import { resolve } from "path";
import { defineConfig, mergeConfig, defaultExclude } from "vitest/config";
import viteConfig from "./vite.config";

export default defineConfig((configEnv) =>
	mergeConfig(
		viteConfig(configEnv),
		defineConfig({
			test: {
				projects: [
					{
						extends: true,
						test: {
							name: "Unit tests",
							environment: "jsdom",
							include: ["src/tests/**/*.test.ts"],
							exclude: [...defaultExclude, "src-tauri/**/*"],
						},
					},
				],
				coverage: {
					provider: "v8",
					include: ["src/**/*.ts", "src/**/*.vue"],
					exclude: [
						"src/main.ts",
						"src/router.ts",
						"src/routes.ts",
						"src/**/*.d.ts",
					],
				},
			},
			resolve: {
				alias: {
					"@test-utils": resolve(__dirname, "/src/tests/__utils__"),
				},
			},
		}),
	),
);
