import { defineConfig } from "vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(() => ({
	plugins: [
		vue({
			features: {
				optionsAPI: false,
			},
		}),
		tailwindcss({
			optimize: {
				minify: true,
			},
		}),
	],
	clearScreen: false,
	server: {
		port: 1420,
		strictPort: true,
		host: host || false,
		hmr: host
			? {
					protocol: "ws",
					host,
					port: 1421,
				}
			: undefined,
		watch: {
			ignored: ["**/src-tauri/**"],
		},
	},
	resolve: {
		extensions: [".ts", ".vue"],
		alias: {
			"@components": resolve(__dirname, "./src/components"),
			"@composables": resolve(__dirname, "./src/composables"),
			"@constants": resolve(__dirname, "./src/constants"),
			"@modules": resolve(__dirname, "./src/modules"),
			"@utils": resolve(__dirname, "./src/utils"),
			"@views": resolve(__dirname, "./src/views"),
		},
	},
}));
