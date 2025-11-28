import { COMMANDS } from "@constants";
import { invoke } from "@tauri-apps/api/core";

export class KeyService {
	/** Retrieve keys from Redis based on the provided options */
	static async getKeys(options: TGetKeysOptions) {
		return invoke<TKey[]>(COMMANDS.GET_KEYS, options);
	}
}
