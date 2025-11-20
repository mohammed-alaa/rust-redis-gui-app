import { COMMANDS } from "@constants";
import { invoke } from "@tauri-apps/api/core";

export class ServerService {

	async addServer(values: TServerFormFields) {
		try {
			const server = await invoke<TServer>(COMMANDS.ADD_SERVER, values);
			return Promise.resolve<TServer>(server);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async getServers(): Promise<TServer[]> {
		try {
			const servers = await invoke<TServer[]>(COMMANDS.GET_SERVERS);
			return Promise.resolve(servers);
		} catch (error) {
			return Promise.reject(error);
		}
	}
}
