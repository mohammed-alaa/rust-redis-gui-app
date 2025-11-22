import { expect, describe, it, afterEach, vi } from "vitest";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { invoke } from "@tauri-apps/api/core";
import { ServerService } from "@services/ServerService";
import { COMMANDS } from "@constants";
import { useServerFactory } from "@test-utils/useServerFactory";

vi.mock("@tauri-apps/api/core", { spy: true });

describe("ServerService", () => {
	const { serverFormFields, server } = useServerFactory().validServer();

	afterEach(() => {
		clearMocks();
		vi.clearAllMocks();
	});

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

	it("can get server", async () => {
		mockIPC((cmd) => {
			if (cmd === COMMANDS.GET_SERVERS) {
				return Array.from({ length: 1 }, () => server);
			}
		});

		await expect(ServerService.getServers()).resolves.toEqual([server]);
		expect(invoke).toHaveBeenCalledWith(COMMANDS.GET_SERVERS);
	});
});
