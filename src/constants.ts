export const DEFAULT_SERVER = {
	name: "Localhost",
	address: "127.0.0.1",
	port: 6379,
};

export const COMMANDS = {
	/**
	 * Add a new server to the list of servers.
	 */
	ADD_SERVER: "add_server",
	/**
	 * Get keys from the server.
	 */
	GET_KEYS: "get_keys",
	/**
	 * Get servers from the server.
	 */
	GET_SERVERS: "get_servers",
};
