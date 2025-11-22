import { COMMANDS } from "@constants";
import { invoke } from "@tauri-apps/api/core";

export class ServerService {
	static async addServer(values: TServerFormFields): Promise<TServer> {
		return await invoke<TServer>(COMMANDS.ADD_SERVER, values);
	}

	static async getServers(): Promise<TServer[]> {
		return await invoke<TServer[]>(COMMANDS.GET_SERVERS);
	}
}
