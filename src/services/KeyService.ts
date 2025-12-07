import { COMMANDS } from "@constants";
import { invoke } from "@tauri-apps/api/core";

export class KeyService {
	/** Retrieve keys from Redis based on the provided filters */
	static async retrieveKeys(filters: TRetrieveFilters) {
		return invoke<TKey[]>(COMMANDS.RETRIEVE_KEYS, filters);
	}

	/** Retrieve a specific key's details from Redis */
	static async retrieveKey(key: TKey["key"]) {
		return invoke<TCurrentKey>(COMMANDS.RETRIEVE_KEY, { key });
	}
}
