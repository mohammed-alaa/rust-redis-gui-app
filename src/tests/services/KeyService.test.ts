import { describe, it, expect, afterEach } from "vitest";
import { KeyService } from "@services/KeyService";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import {
	COMMANDS,
	KEY_TYPE_FILTER_ALL,
	KEY_TYPE_FILTER_STRING,
} from "@constants";

describe("KeyService", () => {
	afterEach(() => {
		clearMocks();
	});

	it("exists", () => {
		expect(KeyService).toBeDefined();
	});

	describe("Retrieve Keys", () => {
		it("exists", () => {
			expect(KeyService).toHaveProperty("retrieveKeys");
		});

		it("retrieves keys", async () => {
			mockIPC(async (cmd) => {
				if (cmd === COMMANDS.RETRIEVE_KEYS) {
					return Promise.resolve<TKey[]>([]);
				}
			});

			const keys = await KeyService.retrieveKeys({
				pattern: "",
				key_type: KEY_TYPE_FILTER_ALL,
			});
			expect(keys).toBeDefined();
			expect(Array.isArray(keys)).toBe(true);
		});

		it("retrieves keys with pattern", async () => {
			mockIPC(async (cmd, args) => {
				if (cmd === COMMANDS.RETRIEVE_KEYS) {
					if ((args as TRetrieveFilters).pattern === "user:*") {
						return Promise.resolve<TKey[]>([
							{
								key: "user:1",
								key_type: KEY_TYPE_FILTER_STRING,
								ttl: -1,
								ttl_formatted: "N/A",
								// memory_usage: 128,
							},
							{
								key: "user:2",
								key_type: KEY_TYPE_FILTER_STRING,
								ttl: -1,
								ttl_formatted: "N/A",
								// memory_usage: 256,
							},
						]);
					}
					return Promise.resolve<TKey[]>([]);
				}
			});

			const keys = await KeyService.retrieveKeys({
				pattern: "user:*",
				key_type: KEY_TYPE_FILTER_ALL,
			});
			expect(keys).toBeDefined();
			expect(Array.isArray(keys)).toBe(true);
			expect(keys.length).toBe(2);
			expect(keys[0].key).toBe("user:1");
			expect(keys[1].key).toBe("user:2");
		});

		it("retrieves keys with key type", async () => {
			mockIPC(async (cmd, args) => {
				if (cmd === COMMANDS.RETRIEVE_KEYS) {
					const key_type = (args as TRetrieveFilters).key_type;
					const allKeys: TKey[] = [];
					for (let i = 1; i <= 10; i++) {
						allKeys.push({
							key: `key:${i}`,
							key_type: ["string", "hash", "list", "set", "zset"][
								i % 5
							] as TKey["key_type"],
							ttl: -1,
							ttl_formatted: "N/A",
							// memory_usage: 64 * i,
						});
					}
					return Promise.resolve<TKey[]>(
						allKeys.filter((key) => key.key_type === key_type),
					);
				}
			});

			const keys = await KeyService.retrieveKeys({
				pattern: "",
				key_type: "string",
			});
			expect(keys).toBeDefined();
			expect(Array.isArray(keys)).toBe(true);
			expect(keys.length).not.toBe(5);
		});

		it("handles no keys found", async () => {
			mockIPC(async (cmd) => {
				if (cmd === COMMANDS.RETRIEVE_KEYS) {
					return Promise.resolve<TKey[]>([]);
				}
			});

			const keys = await KeyService.retrieveKeys({
				pattern: "nonexistent:*",
				key_type: KEY_TYPE_FILTER_ALL,
			});
			expect(keys).toBeDefined();
			expect(Array.isArray(keys)).toBe(true);
			expect(keys.length).toBe(0);
		});

		it("handles errors", async () => {
			const errorMessage = "Failed to retrieve keys";
			mockIPC(async (cmd) => {
				if (cmd === COMMANDS.RETRIEVE_KEYS) {
					return Promise.reject(errorMessage);
				}
			});

			await expect(
				KeyService.retrieveKeys({
					pattern: "",
					key_type: KEY_TYPE_FILTER_ALL,
				}),
			).rejects.toThrow(errorMessage);
		});
	});

	describe("Retrieve Key", () => {
		it("exists", () => {
			expect(KeyService).toHaveProperty("retrieveKey");
		});

		it("retrieves a specific key", async () => {
			const mockKey: TKey = {
				key: "user:1",
				key_type: KEY_TYPE_FILTER_STRING,
				ttl: -1,
				ttl_formatted: "N/A",
				// memory_usage: 128,
			};
			const mockContent: TCurrentKey["content"] = {
				value: "Sample content for user:1",
			};

			mockIPC(async (cmd, args) => {
				if (cmd === COMMANDS.RETRIEVE_KEY) {
					if ((args as { key: string }).key === "user:1") {
						return Promise.resolve<TCurrentKey>({
							details: mockKey,
							content: mockContent,
						});
					}
				}
			});

			const key = await KeyService.retrieveKey("user:1");
			expect(key).toBeDefined();
			expect(key.details).toBe(mockKey);
			expect(key.content).toBe(mockContent);
		});

		it("handles key not found", async () => {
			mockIPC(async (cmd, args) => {
				if (cmd === COMMANDS.RETRIEVE_KEY) {
					if ((args as { key: string }).key === "nonexistent:key") {
						return Promise.reject("Key not found");
					}
				}
			});

			await expect(
				KeyService.retrieveKey("nonexistent:key"),
			).rejects.toThrow("Key not found");
		});
	});
});
