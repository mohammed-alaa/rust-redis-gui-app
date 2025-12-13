import { createPinia } from "pinia";
import { createRouter, createWebHashHistory } from "vue-router";
import { mount } from "@vue/test-utils";
import { describe, it, vi, beforeEach, afterEach, expect } from "vitest";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import Server from "@views/Server/index.vue";
import { useServerFactory } from "@test-utils/useServerFactory";
import { useServerStore } from "@stores/useServerStore";
import { useKeyStore } from "@stores/useKeyStore";
import {
	COMMANDS,
	KEY_TYPE_FILTER_ALL,
	KEY_TYPE_FILTER_LIST,
	KEY_TYPE_FILTER_STRING,
} from "@constants";

describe("Server View", () => {
	// let __servers: TServer[];
	let componentWrapper: ReturnType<typeof mount>;

	beforeEach(() => {
		// __servers = Array.from(
		// 	{ length: 3 },
		// 	() => useServerFactory().validServer().server,
		// );

		componentWrapper = mount(Server, {
			global: {
				stubs: {
					Teleport: true,
				},
				plugins: [
					createPinia(),
					createRouter({
						history: createWebHashHistory(),
						routes: [
							{
								name: "home",
								path: "/",
								component: async () =>
									import("@views/Home/index.vue"),
							},
							{
								name: "server",
								path: "/server",
								component: Server,
							},
							{
								name: "add-server",
								path: "/add-server",
								component: async () =>
									import("@views/Server/index.vue"),
							},
						],
					}),
				],
			},
		});
	});

	afterEach(() => {
		if (componentWrapper) {
			componentWrapper.unmount();
		}

		// __servers = [];
		clearMocks();
		vi.clearAllMocks();
	});

	describe("it renders correctly", () => {
		it("handles inactive/invalid server", async () => {
			expect(componentWrapper.exists()).toBe(true);
			expect(
				componentWrapper.find('[data-testid="go-home-link"]').exists(),
			).toBe(true);
		});

		it("handles active/valid server", async () => {
			const server = useServerFactory().validServer().server;
			const keysFilters: TRetrieveFilters = {
				pattern: "*",
				key_type: KEY_TYPE_FILTER_ALL,
			};

			const keys: TKey[] = [
				{
					key: "key1",
					key_type: KEY_TYPE_FILTER_STRING,
					ttl: -1,
					ttl_formatted: "-",
				},
				{
					key: "key2",
					key_type: KEY_TYPE_FILTER_LIST,
					ttl: 1800,
					ttl_formatted: "30m",
				},
			];
			mockIPC(async (cmd) => {
				if (cmd === COMMANDS.OPEN_SERVER) {
					return Promise.resolve(server);
				} else if (cmd === COMMANDS.RETRIEVE_KEYS) {
					return Promise.resolve(keys);
				}
			});

			const serverStore = useServerStore();
			const keyStore = useKeyStore();

			await vi.waitFor(async () => serverStore.openServer(server.id));
			await vi.waitFor(async () => keyStore.retrieveKeys(keysFilters));

			expect(componentWrapper.exists()).toBe(true);

			const rows = componentWrapper.findAll(
				'[data-testid="keys-table-row"]',
			);
			expect(rows.length).toBe(keys.length);
		});

		it("renders no keys available state", async () => {
			const server = useServerFactory().validServer().server;
			const keysFilters: TRetrieveFilters = {
				pattern: "*",
				key_type: KEY_TYPE_FILTER_ALL,
			};

			mockIPC(async (cmd) => {
				if (cmd === COMMANDS.OPEN_SERVER) {
					return Promise.resolve(server);
				} else if (cmd === COMMANDS.RETRIEVE_KEYS) {
					return Promise.resolve([]);
				}
			});

			const serverStore = useServerStore();
			const keyStore = useKeyStore();

			await vi.waitFor(async () => serverStore.openServer(server.id));
			await vi.waitFor(async () => keyStore.retrieveKeys(keysFilters));

			expect(componentWrapper.exists()).toBe(true);

			const noKeysMessage = componentWrapper.find(
				'[data-testid="keys-table-no-keys-message"]',
			);
			expect(noKeysMessage.exists()).toBe(true);
		});
	});
});
