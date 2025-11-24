import { expect, describe, it, afterEach, vi, beforeEach } from "vitest";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { invoke } from "@tauri-apps/api/core";
import { ServerService } from "@services/ServerService";
import { APP_ERROR_CODES, COMMANDS } from "@constants";
import { useServerFactory } from "@test-utils/useServerFactory";

vi.mock("@tauri-apps/api/core", { spy: true });

describe("ServerService", () => {
	let server: TServer;
	let serverFormFields: TServerFormFields;

	beforeEach(() => {
		const factory = useServerFactory().validServer();
		server = factory.server;
		serverFormFields = factory.serverFormFields;
	});

	afterEach(() => {
		clearMocks();
		vi.clearAllMocks();
	});

	describe("Add Server", () => {
		it("can add server", async () => {
			mockIPC((cmd) => {
				if (cmd === COMMANDS.ADD_SERVER) {
					return server;
				}
			});

			await expect(
				ServerService.addServer(serverFormFields),
			).resolves.toEqual(server);
			expect(invoke).toHaveBeenCalledWith(
				COMMANDS.ADD_SERVER,
				serverFormFields,
			);
		});

		it("handles add server error", async () => {
			const errorCode = APP_ERROR_CODES.REDIS_FAILED;

			mockIPC((cmd) => {
				if (cmd === COMMANDS.ADD_SERVER) {
					throw errorCode;
				}
			});

			await expect(
				ServerService.addServer(serverFormFields),
			).rejects.toBe(
				"Failed to interact with the Redis server. Please check your connection settings.",
			);
			expect(invoke).toHaveBeenCalledWith(
				COMMANDS.ADD_SERVER,
				serverFormFields,
			);
		});
	});

	describe("Get Servers", () => {
		it("can get server", async () => {
			mockIPC((cmd) => {
				if (cmd === COMMANDS.GET_SERVERS) {
					return Array.from({ length: 1 }, () => server);
				}
			});

			await expect(ServerService.getServers()).resolves.toEqual([server]);
			expect(invoke).toHaveBeenCalledWith(COMMANDS.GET_SERVERS);
		});

		it("handles get servers error", async () => {
			const errorCode = APP_ERROR_CODES.DATABASE_NOT_READY;
			mockIPC((cmd) => {
				if (cmd === COMMANDS.GET_SERVERS) {
					throw errorCode;
				}
			});

			await expect(ServerService.getServers()).rejects.toBe(
				"The database is not ready. Please ensure the connection is established.",
			);
			expect(invoke).toHaveBeenCalledWith(COMMANDS.GET_SERVERS);
		});
	});

	describe("Open Server", () => {
		it("can open server", async () => {
			mockIPC((cmd) => {
				if (cmd === COMMANDS.OPEN_SERVER) {
					return server;
				}
			});

			await expect(ServerService.openServer(server.id)).resolves.toEqual(
				server,
			);
			expect(invoke).toHaveBeenCalledWith(COMMANDS.OPEN_SERVER, {
				id: server.id,
			});
		});

		it("handles open server error", async () => {
			const errorCode = APP_ERROR_CODES.DATABASE_QUERY_FAILED;
			mockIPC((cmd) => {
				if (cmd === COMMANDS.OPEN_SERVER) {
					throw errorCode;
				}
			});

			await expect(ServerService.openServer(server.id)).rejects.toBe(
				"A database query has failed. Please try again.",
			);
			expect(invoke).toHaveBeenCalledWith(COMMANDS.OPEN_SERVER, {
				id: server.id,
			});
		});
	});

	describe("Close Server", () => {
		it("can close server", async () => {
			mockIPC((cmd) => {
				if (cmd === COMMANDS.CLOSE_SERVER) {
					return null;
				}
			});

			await expect(ServerService.closeServer()).resolves.toBe(null);
			expect(invoke).toHaveBeenCalledWith(COMMANDS.CLOSE_SERVER);
		});

		it("handles close server error", async () => {
			const errorCode = APP_ERROR_CODES.REDIS_FAILED;
			mockIPC((cmd) => {
				if (cmd === COMMANDS.CLOSE_SERVER) {
					throw errorCode;
				}
			});

			await expect(ServerService.closeServer()).rejects.toBe(
				"Failed to interact with the Redis server. Please check your connection settings.",
			);
			expect(invoke).toHaveBeenCalledWith(COMMANDS.CLOSE_SERVER);
		});
	});
});
