import { COMMANDS } from "@constants";
import { invoke } from "@tauri-apps/api/core";

export class KeyService {
	/** Retrieve keys from Redis based on the provided options */
	static async retrieveKeys(options: TRetrieveKeysOptions) {
		return invoke<TKey[]>(COMMANDS.RETRIEVE_KEYS, options);
	}

	/** Retrieve a specific key's details from Redis */
	static async retrieveKey(key: TKey["key"]) {
		return invoke<TKey>(COMMANDS.RETRIEVE_KEY, { key });
	}
}
