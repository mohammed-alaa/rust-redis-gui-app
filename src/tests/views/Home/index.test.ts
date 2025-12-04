import { createPinia } from "pinia";
import { createRouter, createWebHashHistory } from "vue-router";
import { mount } from "@vue/test-utils";
import { describe, it, vi, beforeEach, afterEach, expect } from "vitest";
import { mockIPC, clearMocks } from "@tauri-apps/api/mocks";
import Home from "@views/Home/index.vue";
import { useServerFactory } from "@test-utils/useServerFactory";
import { APP_ERROR_CODES, COMMANDS } from "@constants";
import { useServerStore } from "@stores/useServerStore";

describe("Home View", () => {
	let servers: TServer[];
	let componentWrapper: ReturnType<typeof mount>;

	beforeEach(() => {
		servers = Array.from(
			{ length: 3 },
			() => useServerFactory().validServer().server,
		);

		componentWrapper = mount(Home, {
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
								component: Home,
							},
							{
								name: "server",
								path: "/server",
								component: async () =>
									import("@views/AddServer/index.vue"),
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

		servers = [];
		clearMocks();
		vi.clearAllMocks();
	});

	it("should render correctly", async () => {
		expect(componentWrapper.exists()).toBe(true);
	});

	describe("Fetching Servers", () => {
		it("should fetch and display the list of servers", async () => {
			mockIPC(async (cmd) => {
				if (cmd === COMMANDS.GET_SERVERS) {
					return Promise.resolve(servers);
				}
			});

			await vi.waitFor(async () => useServerStore().getServers());

			expect(componentWrapper.text()).not.toContain("No servers found");
			expect(
				componentWrapper.findAll("[data-testid='server-row']").length,
			).toBe(servers.length);
		});

		it("should display 'No servers found' when there are no servers", async () => {
			mockIPC(async (cmd) => {
				if (cmd === COMMANDS.GET_SERVERS) {
					return Promise.resolve([]);
				}
			});

			await vi.waitFor(async () => useServerStore().getServers());

			expect(componentWrapper.text()).toContain("No servers found");
			expect(
				componentWrapper.findAll("[data-testid='server-row']").length,
			).toBe(0);
		});
	});

	describe("Navigation to Server View", () => {
		it("should navigate to add server view when 'Add Server' link is clicked", async () => {
			const router = componentWrapper.vm.$router;
			const pushSpy = vi.spyOn(router, "push");

			const addServerLink = componentWrapper.find(
				"[data-testid='add-server-link']",
			);

			await addServerLink.trigger("click");

			expect(pushSpy).toHaveBeenCalledWith({ name: "add-server" });
		});

		it("should navigate to add server view when 'Add Server' button is clicked", async () => {
			const router = componentWrapper.vm.$router;
			const pushSpy = vi.spyOn(router, "push");

			const addServerLink = componentWrapper.find(
				"[data-testid='add-server-button']",
			);
			await addServerLink.trigger("click");

			expect(pushSpy).toHaveBeenCalledWith({ name: "add-server" });
		});
	});

	describe("Opens Server", () => {
		it("should open server when connect button is clicked", async () => {
			mockIPC(async (cmd, args) => {
				if (cmd === COMMANDS.GET_SERVERS) {
					return Promise.resolve(servers);
				} else if (cmd === COMMANDS.OPEN_SERVER) {
					const server = servers.find(
						(s) => s.id === ((args as any).id as TServer["id"]),
					);
					return Promise.resolve(server);
				}
			});

			const router = componentWrapper.vm.$router;
			const pushSpy = vi.spyOn(router, "push");
			const serverStore = useServerStore();
			await vi.waitFor(async () => serverStore.getServers());

			const firstServerRow = componentWrapper.find(
				'[data-testid="server-row"]',
			);

			const connectButton = firstServerRow.find(
				'[data-testid="server-row-action-connect"]',
			);

			await connectButton.trigger("click");
			await vi.waitFor(async () => serverStore.openServer(servers[0].id));

			expect(pushSpy).toHaveBeenCalledExactlyOnceWith({ name: "server" });
			expect(serverStore.activeServer).toEqual(servers[0]);
		});

		it("should not open server when non existing server is clicked", async () => {
			mockIPC(async (cmd) => {
				if (cmd === COMMANDS.GET_SERVERS) {
					return Promise.resolve(servers);
				} else if (cmd === COMMANDS.OPEN_SERVER) {
					return Promise.reject(APP_ERROR_CODES.DATABASE_NOT_READY);
				}
			});

			const pushSpy = vi.spyOn(componentWrapper.vm.$router, "push");
			const serverStore = useServerStore();

			await vi.waitFor(async () => serverStore.getServers());

			const firstServerRow = componentWrapper.find(
				'[data-testid="server-row"]',
			);

			const connectButton = firstServerRow.find(
				'[data-testid="server-row-action-connect"]',
			);

			await connectButton.trigger("click");

			try {
				await vi.waitFor(async () =>
					serverStore.openServer("non-existing-id"),
				);
			} catch (_) {}

			expect(pushSpy).not.toHaveBeenCalled();
			expect(serverStore.activeServer).toBeNull();
		});
	});
});
