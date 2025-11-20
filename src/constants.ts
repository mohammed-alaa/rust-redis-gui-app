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
	 * Retrieve the list of configured servers.
	 */
	GET_SERVERS: "get_servers",
};
