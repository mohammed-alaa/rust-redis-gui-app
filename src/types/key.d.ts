import { type InvokeArgs } from "@tauri-apps/api/core";

declare global {
	interface TKey {
		key: string;
		key_type: string;
		ttl: number;
		memory_usage: number;
	}

	interface TKeyOptions {
		filter: string;
		limit: number;
	}

	type TGetKeysOptions = InvokeArgs & TKeyOptions;
}
