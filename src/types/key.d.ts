import { type InvokeArgs } from "@tauri-apps/api/core";

declare global {
	interface TKey {
		key: string;
		key_type: "string" | "hash" | "list" | "set" | "zset";
		ttl: number;
		ttl_formatted: string;
		// memory_usage: number;
	}

	interface TRetrieveFilters extends Record<string, unknown> {
		pattern: string;
		limit: number;
	}

	interface TKeyContent extends any {}

	interface TCurrentKey {
		details: TKey;
		content: TKeyContent;
	}
}
