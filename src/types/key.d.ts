import { type InvokeArgs } from "@tauri-apps/api/core";

declare global {
	interface TKey {
		key: string;
		key_type: string;
		ttl: number;
		// memory_usage: number;
	}

	interface TRetrieveOptions {
		filter: string;
		limit: number;
	}

	type TRetrieveKeysOptions = InvokeArgs & TRetrieveOptions;
}
