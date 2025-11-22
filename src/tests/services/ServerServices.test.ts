import { expect, describe, it, afterEach, vi } from "vitest";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { invoke } from "@tauri-apps/api/core";
import { ServerService } from "@services/ServerService";
import { COMMANDS } from "@constants";

describe("ServerService", () => {
	afterEach(() => {
		clearMocks();
		vi.clearAllMocks();
	});

	it("can add server", async () => {
		const serverFields: TServerFormFields = {
			name: "Local Redis",
			address: "127.0.0.1",
			port: 6379,
		};

		const server: TServer = {
			...serverFields,
			id: "some-unique-id",
			created_at: new Date(),
			updated_at: new Date(),
		};

		mockIPC((cmd) => {
			if (cmd === COMMANDS.ADD_SERVER) {
				return server;
			}
		});

		await expect(ServerService.addServer(serverFields)).resolves.toEqual(
			server,
		);
		expect(invoke).toHaveBeenCalledWith(COMMANDS.ADD_SERVER, serverFields);
	});

	it("can get server", async () => {
		const server: TServer = {
			name: "Local Redis",
			address: "127.0.0.1",
			port: 6379,
			id: "some-unique-id",
			created_at: new Date(),
			updated_at: new Date(),
		};

		mockIPC((cmd) => {
			if (cmd === COMMANDS.GET_SERVERS) {
				return Array.from({ length: 1 }, () => server);
			}
		});

		await expect(ServerService.getServers()).resolves.toEqual([server]);
		expect(invoke).toHaveBeenCalledWith(COMMANDS.GET_SERVERS);
	});
});
