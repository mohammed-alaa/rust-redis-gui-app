import { beforeEach, expect, describe, it, afterEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useServerStore } from "@stores/useServerStore";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { COMMANDS } from "@constants";
import { useServerFactory } from "@test-utils/useServerFactory";

describe("useServerStore", () => {
	let server: TServer;
	let serverFormFields: TServerFormFields;

	beforeEach(() => {
		const factory = useServerFactory().validServer();
		server = factory.server;
		serverFormFields = factory.serverFormFields;
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
		it("adds a server correctly", async () => {
			mockIPC((cmd) => {
				if (cmd === COMMANDS.ADD_SERVER) {
					return server;
				}
			});
			const serverStore = useServerStore();

			const addedServer = await serverStore.addServer(serverFormFields);
			expect(serverStore.servers).toContainEqual(server);
			expect(addedServer).toEqual(server);
		});

		it("handles errors when adding a server", async () => {
			const errorMessage = "Failed to add server";
			mockIPC((cmd) => {
				if (cmd === COMMANDS.ADD_SERVER) {
					return Promise.reject(errorMessage);
				}
			});
			const serverStore = useServerStore();

			expect(serverStore.servers).toEqual([]);
			expect(serverStore.addServer(serverFormFields)).rejects.toThrow(
				errorMessage,
			);
		});
	});
});
