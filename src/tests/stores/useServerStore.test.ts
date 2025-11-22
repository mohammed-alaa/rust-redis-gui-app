import { beforeEach, expect, describe, it, afterEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useServerStore } from "@stores/useServerStore";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { COMMANDS } from "@constants";

describe("useServerStore", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	afterEach(() => {
		clearMocks();
		vi.clearAllMocks();
	});

	describe("initializes", () => {
		it("initializes with empty servers array", () => {
			const serverStore = useServerStore();
			expect(serverStore.servers).toEqual([]);
		});
	});

	describe("get servers", () => {
		it("fetches servers correctly", async () => {
			const server: TServer = {
				name: "Test Server",
				address: "localhost",
				port: 6379,
				id: "server-1231",
				created_at: new Date(),
				updated_at: new Date(),
			};
			mockIPC((cmd) => {
				if (cmd === COMMANDS.GET_SERVERS) {
					return Array.from({ length: 1 }, () => server);
				}
			});
			const serverStore = useServerStore();

			await serverStore.getServers();
			expect(serverStore.servers).toContainEqual(server);
		});

		it("handles errors when fetching servers", async () => {
			mockIPC((cmd) => {
				if (cmd === COMMANDS.GET_SERVERS) {
					return Promise.reject("Failed to fetch servers");
				}
			});
			const serverStore = useServerStore();

			try {
				await serverStore.getServers();
			} catch (_) {}
			expect(serverStore.servers).toEqual([]);
		});
	});

	describe("add server", () => {
		const newServer: TServerFormFields = {
			name: "Test Server",
			address: "localhost",
			port: 6379,
		};

		const server: TServer = {
			...newServer,
			id: "server-awd12",
			created_at: new Date(),
			updated_at: new Date(),
		};

		it("adds a server correctly", async () => {
			mockIPC((cmd) => {
				if (cmd === COMMANDS.ADD_SERVER) {
					return server;
				}
			});
			const serverStore = useServerStore();

			const addedServer = await serverStore.addServer(newServer);
			expect(serverStore.servers).toContainEqual(server);
			expect(addedServer).toEqual(server);
		});

		it("handles errors when adding a server", async () => {
			mockIPC((cmd) => {
				if (cmd === COMMANDS.ADD_SERVER) {
					return Promise.reject("Failed to add server");
				}
			});
			const serverStore = useServerStore();

			try {
				await serverStore.addServer(newServer);
			} catch (error) {
				expect(error).toBe("Failed to add server");
			}
			expect(serverStore.servers).toEqual([]);
		});
	});
});
