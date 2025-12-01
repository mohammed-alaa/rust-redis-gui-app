import { type InvokeArgs } from "@tauri-apps/api/core";

declare global {
	interface TKey {
		key: string;
		key_type: string;
		ttl: number;
		// memory_usage: number;
	}

	interface TRetrieveFilters {
		pattern: string;
		limit: number;
	}

	type TRetrieveKeysFilters = InvokeArgs & TRetrieveFilters;

	interface TKeyContent extends any {}

	interface TCurrentKey {
		details?: TKey | null;
		content?: TKeyContent | null;
	}
}
