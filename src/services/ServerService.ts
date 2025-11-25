import { APP_ERROR_CODES, COMMANDS } from "@constants";
import { invoke } from "@tauri-apps/api/core";

export class ServerService {
	static handleErrorCodes(errorCode: APP_ERROR_CODES) {
		let errorMessage = "";

		switch (errorCode) {
			case APP_ERROR_CODES.REDIS_FAILED:
				errorMessage =
					"Failed to interact with the Redis server. Please check your connection settings.";
				break;
			case APP_ERROR_CODES.DATABASE_NOT_READY:
				errorMessage =
					"The database is not ready. Please ensure the connection is established.";
				break;
			case APP_ERROR_CODES.DATABASE_QUERY_FAILED:
				errorMessage = "A database query has failed. Please try again.";
				break;
		}

		return errorMessage;
	}

	static formatServer(server: TServerFromBackend): TServer {
		return {
			...server,
			created_at: new Date(server.created_at),
			updated_at: new Date(server.updated_at),
		} as TServer;
	}

	static async addServer(values: TServerFormFields): Promise<TServer> {
		try {
			const server = await invoke<TServerFromBackend>(
				COMMANDS.ADD_SERVER,
				values,
			);
			return ServerService.formatServer(server);
		} catch (error) {
			return Promise.reject(
				ServerService.handleErrorCodes(error as APP_ERROR_CODES),
			);
		}
	}

	static async getServers(): Promise<TServer[]> {
		try {
			return (
				await invoke<TServerFromBackend[]>(COMMANDS.GET_SERVERS)
			).map((server) => ServerService.formatServer(server));
		} catch (error) {
			return Promise.reject(
				ServerService.handleErrorCodes(error as APP_ERROR_CODES),
			);
		}
	}

	static async openServer(id: TServer["id"]): Promise<TServer> {
		try {
			const server = await invoke<TServerFromBackend>(
				COMMANDS.OPEN_SERVER,
				{ id },
			);
			return ServerService.formatServer(server);
		} catch (error) {
			return Promise.reject(
				ServerService.handleErrorCodes(error as APP_ERROR_CODES),
			);
		}
	}

	static async closeServer(): Promise<void> {
		try {
			return await invoke<void>(COMMANDS.CLOSE_SERVER);
		} catch (error) {
			return Promise.reject(
				ServerService.handleErrorCodes(error as APP_ERROR_CODES),
			);
		}
	}
}
