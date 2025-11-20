import { COMMANDS } from "@constants";
import { invoke } from "@tauri-apps/api/core";

export class ServerService {
	async addServer(values: TServerFormFields): Promise<TServer> {
		try {
			return await invoke<TServer>(COMMANDS.ADD_SERVER, values);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async getServers(): Promise<TServer[]> {
		try {
			return await invoke<TServer[]>(COMMANDS.GET_SERVERS);
		} catch (error) {
			return Promise.reject(error);
		}
	}
}
