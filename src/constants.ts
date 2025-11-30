export const COMMANDS = {
	/**
	 * Add a new server to the list of servers.
	 */
	ADD_SERVER: "add_server",
	/**
	 * Retrieve keys from the server.
	 */
	RETRIEVE_KEYS: "retrieve_keys",
	/**
	 * Retrieve the list of configured servers.
	 */
	GET_SERVERS: "get_servers",
	/**
	 * Open a connection to the specified server.
	 */
	OPEN_SERVER: "open_server",
	/**
	 * Close the connection to the specified server.
	 */
	CLOSE_SERVER: "close_server",
	/** Retrieve details of a specific key from the server. */
	RETRIEVE_KEY: "retrieve_key",
};

/**
 * @enum APP_ERROR_CODES
 * @description Application-specific error codes for handling various error scenarios.
 * @property {number} REDIS_FAILED - Error code for Redis interaction failures.
 * @property {number} DATABASE_NOT_READY - Error code for database not being ready.
 * @property {number} DATABASE_QUERY_FAILED - Error code for generic database query failures.
 */
export enum APP_ERROR_CODES {
	/**
	 * Failure to interact with Redis server, e.g., connection failed, command failed
	 */
	REDIS_FAILED = 910,
	/**
	 * Database is not ready, e.g., connection not established
	 */
	DATABASE_NOT_READY = 900,
	/**
	 * Generic database query failure, e.g., SELECT, UPDATE, DELETE
	 */
	DATABASE_QUERY_FAILED = 901,
}
