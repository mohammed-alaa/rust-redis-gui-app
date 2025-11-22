import { COMMANDS } from "@constants";
import { invoke } from "@tauri-apps/api/core";

export class ServerService {
	static addServer(values: TServerFormFields): Promise<TServer> {
		return invoke<TServer>(COMMANDS.ADD_SERVER, values);
	}

	static getServers(): Promise<TServer[]> {
		return invoke<TServer[]>(COMMANDS.GET_SERVERS);
	}

	static openServer(id: TServer["id"]): Promise<TServer> {
		return invoke<TServer>(COMMANDS.OPEN_SERVER, { id });
	}

	static closeServer(): Promise<void> {
		return invoke<void>(COMMANDS.CLOSE_SERVER);
	}
}
