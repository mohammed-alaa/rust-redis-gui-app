import { COMMANDS } from "@constants";
import { invoke } from "@tauri-apps/api/core";

export class ServerService {
	static async addServer(values: TServerFormFields): Promise<TServer> {
		return invoke<TServer>(COMMANDS.ADD_SERVER, values);
	}

	static async getServers(): Promise<TServer[]> {
		return invoke<TServer[]>(COMMANDS.GET_SERVERS);
	}

	static async openServer(id: TServer["id"]): Promise<TServer> {
		return invoke<TServer>(COMMANDS.OPEN_SERVER, { id });
	}

	static async closeServer(): Promise<void> {
		return invoke<void>(COMMANDS.CLOSE_SERVER);
	}
}
