import { createPinia } from "pinia";
import { createRouter, createWebHashHistory } from "vue-router";
import { mount } from "@vue/test-utils";
import { describe, it, vi, beforeEach, afterEach, expect } from "vitest";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { useServerFactory } from "@test-utils/useServerFactory";
import { useServerStore } from "@stores/useServerStore";
import { useKeyStore } from "@stores/useKeyStore";
import {
	COMMANDS,
	KEY_TYPE_FILTER_ALL,
	KEY_TYPE_FILTER_HASH,
	KEY_TYPE_FILTER_LIST,
	KEY_TYPE_FILTER_SET,
	KEY_TYPE_FILTER_STRING,
	KEY_TYPE_FILTER_ZSET,
} from "@constants";
import Server from "@views/Server/index.vue";
import String from "@views/Server/components/KeyTypes/String.vue";
import Hash from "@views/Server/components/KeyTypes/Hash.vue";
import List from "@views/Server/components/KeyTypes/List.vue";
import SetRenderer from "@views/Server/components/KeyTypes/Set.vue";

describe("Server View", () => {
	let componentWrapper: ReturnType<typeof mount>;

	beforeEach(() => {
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

		describe("Value Renderer", () => {
			const server = useServerFactory().validServer().server;
			const keysFilters: TRetrieveFilters = {
				pattern: "*",
				key_type: KEY_TYPE_FILTER_ALL,
			};

			it("renders string key value correctly", async () => {
				const keys: TKey[] = [
					{
						key: "key1",
						key_type: KEY_TYPE_FILTER_STRING,
						ttl: -1,
						ttl_formatted: "-",
					},
				];

				const activeKey: TCurrentKey = {
					content: "This is a string value",
					details: keys[0],
				};

				mockIPC(async (cmd) => {
					if (cmd === COMMANDS.OPEN_SERVER) {
						return Promise.resolve(server);
					} else if (cmd === COMMANDS.RETRIEVE_KEYS) {
						return Promise.resolve(keys);
					} else if (cmd === COMMANDS.RETRIEVE_KEY) {
						return Promise.resolve(activeKey);
					}
				});

				const serverStore = useServerStore();
				const keyStore = useKeyStore();

				await vi.waitFor(async () => serverStore.openServer(server.id));
				await vi.waitFor(async () =>
					keyStore.retrieveKeys(keysFilters),
				);
				await vi.waitFor(async () => keyStore.retrieveKey(keys[0].key));

				expect(componentWrapper.findComponent(String).exists()).toBe(
					true,
				);
			});

			it("renders hash key value correctly", async () => {
				const keys: TKey[] = [
					{
						key: "key1",
						key_type: KEY_TYPE_FILTER_HASH,
						ttl: -1,
						ttl_formatted: "-",
					},
				];

				const activeKey: TCurrentKey = {
					content: {
						field1: "value1",
						field2: "value2",
					},
					details: keys[0],
				};

				mockIPC(async (cmd) => {
					if (cmd === COMMANDS.OPEN_SERVER) {
						return Promise.resolve(server);
					} else if (cmd === COMMANDS.RETRIEVE_KEYS) {
						return Promise.resolve(keys);
					} else if (cmd === COMMANDS.RETRIEVE_KEY) {
						return Promise.resolve(activeKey);
					}
				});

				const serverStore = useServerStore();
				const keyStore = useKeyStore();

				await vi.waitFor(async () => serverStore.openServer(server.id));
				await vi.waitFor(async () =>
					keyStore.retrieveKeys(keysFilters),
				);
				await vi.waitFor(async () => keyStore.retrieveKey(keys[0].key));

				expect(componentWrapper.findComponent(Hash).exists()).toBe(
					true,
				);
			});

			it("renders list key value correctly", async () => {
				const keys: TKey[] = [
					{
						key: "key1",
						key_type: KEY_TYPE_FILTER_LIST,
						ttl: -1,
						ttl_formatted: "-",
					},
				];

				const activeKey: TCurrentKey = {
					content: ["item1", "item2", "item3"],
					details: keys[0],
				};

				mockIPC(async (cmd) => {
					if (cmd === COMMANDS.OPEN_SERVER) {
						return Promise.resolve(server);
					} else if (cmd === COMMANDS.RETRIEVE_KEYS) {
						return Promise.resolve(keys);
					} else if (cmd === COMMANDS.RETRIEVE_KEY) {
						return Promise.resolve(activeKey);
					}
				});

				const serverStore = useServerStore();
				const keyStore = useKeyStore();

				await vi.waitFor(async () => serverStore.openServer(server.id));
				await vi.waitFor(async () =>
					keyStore.retrieveKeys(keysFilters),
				);
				await vi.waitFor(async () => keyStore.retrieveKey(keys[0].key));

				expect(componentWrapper.findComponent(List).exists()).toBe(
					true,
				);
			});

			it("renders set key value correctly", async () => {
				const keys: TKey[] = [
					{
						key: "key1",
						key_type: KEY_TYPE_FILTER_SET,
						ttl: -1,
						ttl_formatted: "-",
					},
				];

				const activeKey: TCurrentKey = {
					content: new Set(["member1", "member2", "member3"]),
					details: keys[0],
				};

				mockIPC(async (cmd) => {
					if (cmd === COMMANDS.OPEN_SERVER) {
						return Promise.resolve(server);
					} else if (cmd === COMMANDS.RETRIEVE_KEYS) {
						return Promise.resolve(keys);
					} else if (cmd === COMMANDS.RETRIEVE_KEY) {
						return Promise.resolve(activeKey);
					}
				});

				const serverStore = useServerStore();
				const keyStore = useKeyStore();

				await vi.waitFor(async () => serverStore.openServer(server.id));
				await vi.waitFor(async () =>
					keyStore.retrieveKeys(keysFilters),
				);
				await vi.waitFor(async () => keyStore.retrieveKey(keys[0].key));

				expect(componentWrapper.findComponent(Set).exists()).toBe(true);
			});

			it("renders z-set key value correctly", async () => {
				const keys: TKey[] = [
					{
						key: "key1",
						key_type: KEY_TYPE_FILTER_ZSET,
						ttl: -1,
						ttl_formatted: "-",
					},
				];

				const activeKey: TCurrentKey = {
					content: new Set(["member1", "member2", "member3"]),
					details: keys[0],
				};

				mockIPC(async (cmd) => {
					if (cmd === COMMANDS.OPEN_SERVER) {
						return Promise.resolve(server);
					} else if (cmd === COMMANDS.RETRIEVE_KEYS) {
						return Promise.resolve(keys);
					} else if (cmd === COMMANDS.RETRIEVE_KEY) {
						return Promise.resolve(activeKey);
					}
				});

				const serverStore = useServerStore();
				const keyStore = useKeyStore();

				await vi.waitFor(async () => serverStore.openServer(server.id));
				await vi.waitFor(async () =>
					keyStore.retrieveKeys(keysFilters),
				);
				await vi.waitFor(async () => keyStore.retrieveKey(keys[0].key));

				expect(
					componentWrapper.findComponent(SetRenderer).exists(),
				).toBe(true);
			});
		});
	});
});
