import {
	defineConfig,
	mergeConfig,
	defaultExclude,
	defaultInclude,
} from "vitest/config";
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
							include: [
								...defaultInclude,
								"src/tests/**/*.test.ts",
							],
							exclude: [...defaultExclude, "src-tauri/**/*"],
						},
					},
				],
			},
		}),
	),
);
