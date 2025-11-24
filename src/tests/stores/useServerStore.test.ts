import { beforeEach, expect, describe, it, afterEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useServerStore } from "@stores/useServerStore";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { APP_ERROR_CODES, COMMANDS } from "@constants";
import { useServerFactory } from "@test-utils/useServerFactory";
import { ServerService } from "@services/ServerService";

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

	describe("initializes & resets", () => {
		it("initializes with empty servers array", () => {
			const serverStore = useServerStore();
			expect(serverStore.servers).toEqual([]);
		});

		it("resets correctly", () => {
			const serverStore = useServerStore();
			serverStore.servers = [server];
			serverStore.activeServer = server;

			serverStore.$reset();

			expect(serverStore.servers).toEqual([]);
			expect(serverStore.activeServer).toBeNull();
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

			await expect(serverStore.getServers()).resolves.toEqual([server]);
			expect(serverStore.servers).toContainEqual(server);
		});

		it("handles errors when fetching servers", async () => {
			const errorMessage = ServerService.handleErrorCodes(
				APP_ERROR_CODES.REDIS_FAILED,
			);
			mockIPC(async (cmd) => {
				if (cmd === COMMANDS.GET_SERVERS) {
					return Promise.reject(APP_ERROR_CODES.REDIS_FAILED);
				}
			});
			const serverStore = useServerStore();

			await expect(serverStore.getServers()).rejects.toThrow(
				errorMessage,
			);
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

			await expect(
				serverStore.addServer(serverFormFields),
			).resolves.toEqual(server);
			expect(serverStore.servers).toContainEqual(server);
		});

		it("handles errors when adding a server", async () => {
			const errorMessage = ServerService.handleErrorCodes(
				APP_ERROR_CODES.REDIS_FAILED,
			);
			mockIPC(async (cmd) => {
				if (cmd === COMMANDS.ADD_SERVER) {
					return Promise.reject(APP_ERROR_CODES.REDIS_FAILED);
				}
			});
			const serverStore = useServerStore();

			expect(serverStore.servers).toEqual([]);
			await expect(
				serverStore.addServer(serverFormFields),
			).rejects.toThrow(errorMessage);
		});
	});

	describe("open server", () => {
		it("opens a server correctly", async () => {
			mockIPC((cmd) => {
				if (cmd === COMMANDS.OPEN_SERVER) {
					return server;
				}
			});

			const serverStore = useServerStore();
			await expect(serverStore.openServer(server.id)).resolves.toEqual(
				server,
			);
			expect(serverStore.activeServer).toEqual(server);
			expect(serverStore.isConnected).toBe(true);
		});

		it("handles errors when opening a server", async () => {
			const errorMessage = ServerService.handleErrorCodes(
				APP_ERROR_CODES.REDIS_FAILED,
			);
			mockIPC(async (cmd) => {
				if (cmd === COMMANDS.OPEN_SERVER) {
					return Promise.reject(APP_ERROR_CODES.REDIS_FAILED);
				}
			});

			const serverStore = useServerStore();
			await expect(serverStore.openServer(server.id)).rejects.toThrow(
				errorMessage,
			);
			expect(serverStore.activeServer).toBeNull();
			expect(serverStore.isConnected).toBe(false);
		});

		it("does nothing when opening an already active server", async () => {
			let openServerCallCount = 0;
			mockIPC((cmd) => {
				if (cmd === COMMANDS.OPEN_SERVER) {
					openServerCallCount += 1;
					return server;
				}
			});

			const serverStore = useServerStore();
			await serverStore.openServer(server.id);
			expect(serverStore.activeServer).toEqual(server);
			expect(openServerCallCount).toBe(1);

			// Attempt to open the same server again
			await serverStore.openServer(server.id);
			expect(serverStore.activeServer).toEqual(server);
			expect(openServerCallCount).toBe(1);
		});

		it("closes the current server when opening a different server", async () => {
			const anotherServer = useServerFactory().validServer().server;

			let openServerCallCount = 0;
			let closeServerCallCount = 0;

			mockIPC((cmd) => {
				if (cmd === COMMANDS.OPEN_SERVER) {
					openServerCallCount += 1;
					if (openServerCallCount === 1) {
						return server;
					} else {
						return anotherServer;
					}
				}
				if (cmd === COMMANDS.CLOSE_SERVER) {
					closeServerCallCount += 1;
					return;
				}
			});

			const serverStore = useServerStore();
			await serverStore.openServer(server.id);
			expect(serverStore.activeServer).toEqual(server);
			expect(openServerCallCount).toBe(1);
			expect(closeServerCallCount).toBe(0);

			// Open a different server
			await serverStore.openServer(anotherServer.id);
			expect(serverStore.activeServer).toEqual(anotherServer);
			expect(openServerCallCount).toBe(2);
			expect(closeServerCallCount).toBe(1);
		});
	});

	describe("close server", () => {
		it("closes an active server correctly", async () => {
			mockIPC((cmd) => {
				if (cmd === COMMANDS.OPEN_SERVER) {
					return server;
				}
				if (cmd === COMMANDS.CLOSE_SERVER) {
					return;
				}
			});

			const serverStore = useServerStore();
			await serverStore.openServer(server.id);
			expect(serverStore.activeServer).toEqual(server);

			await serverStore.closeServer();
			expect(serverStore.activeServer).toBeNull();
			expect(serverStore.isConnected).toBe(false);
		});

		it("does nothing when closing with no active server", async () => {
			const serverStore = useServerStore();
			expect(serverStore.activeServer).toBeNull();

			await expect(serverStore.closeServer()).resolves.toBeUndefined();
			expect(serverStore.activeServer).toBeNull();
		});

		it("handles errors when closing a server", async () => {
			const errorMessage = ServerService.handleErrorCodes(
				APP_ERROR_CODES.REDIS_FAILED,
			);
			mockIPC(async (cmd) => {
				if (cmd === COMMANDS.OPEN_SERVER) {
					return server;
				}
				if (cmd === COMMANDS.CLOSE_SERVER) {
					return Promise.reject(APP_ERROR_CODES.REDIS_FAILED);
				}
			});

			const serverStore = useServerStore();
			await serverStore.openServer(server.id);
			expect(serverStore.activeServer).toEqual(server);

			await expect(serverStore.closeServer()).rejects.toThrow(
				errorMessage,
			);

			expect(serverStore.activeServer).toEqual(server);
			expect(serverStore.isConnected).toBe(true);
		});
	});
});
