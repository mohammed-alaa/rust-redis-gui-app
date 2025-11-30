import { describe, it, expect, afterEach } from "vitest";
import { KeyService } from "@services/KeyService";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { COMMANDS } from "@constants";

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
			mockIPC((cmd) => {
				if (cmd === COMMANDS.RETRIEVE_KEYS) {
					return Promise.resolve<TKey[]>([]);
				}
			});

			const keys = await KeyService.retrieveKeys({
				filter: "",
				limit: 100,
			});
			expect(keys).toBeDefined();
			expect(Array.isArray(keys)).toBe(true);
		});

		it("retrieves keys with filter", async () => {
			mockIPC((cmd, args) => {
				if (cmd === COMMANDS.RETRIEVE_KEYS) {
					if ((args as TRetrieveKeysOptions).filter === "user:*") {
						return Promise.resolve<TKey[]>([
							{
								key: "user:1",
								key_type: "string",
								ttl: -1,
								memory_usage: 128,
							},
							{
								key: "user:2",
								key_type: "string",
								ttl: -1,
								memory_usage: 256,
							},
						]);
					}
					return Promise.resolve<TKey[]>([]);
				}
			});

			const keys = await KeyService.retrieveKeys({
				filter: "user:*",
				limit: 100,
			});
			expect(keys).toBeDefined();
			expect(Array.isArray(keys)).toBe(true);
			expect(keys.length).toBe(2);
			expect(keys[0].key).toBe("user:1");
			expect(keys[1].key).toBe("user:2");
		});

		it("retrieves keys with limit", async () => {
			mockIPC((cmd, args) => {
				if (cmd === COMMANDS.RETRIEVE_KEYS) {
					const limit = (args as TRetrieveKeysOptions).limit;
					const allKeys: TKey[] = [];
					for (let i = 1; i <= 10; i++) {
						allKeys.push({
							key: `key:${i}`,
							key_type: "string",
							ttl: -1,
							memory_usage: 64 * i,
						});
					}
					return Promise.resolve<TKey[]>(allKeys.slice(0, limit));
				}
			});

			const keys = await KeyService.retrieveKeys({
				filter: "",
				limit: 5,
			});
			expect(keys).toBeDefined();
			expect(Array.isArray(keys)).toBe(true);
			expect(keys.length).toBe(5);
			expect(keys[0].key).toBe("key:1");
			expect(keys[4].key).toBe("key:5");
		});

		it("handles no keys found", async () => {
			mockIPC((cmd) => {
				if (cmd === COMMANDS.RETRIEVE_KEYS) {
					return Promise.resolve<TKey[]>([]);
				}
			});

			const keys = await KeyService.retrieveKeys({
				filter: "nonexistent:*",
				limit: 100,
			});
			expect(keys).toBeDefined();
			expect(Array.isArray(keys)).toBe(true);
			expect(keys.length).toBe(0);
		});

		it("handles errors", async () => {
			const errorMessage = "Failed to retrieve keys";
			mockIPC((cmd) => {
				if (cmd === COMMANDS.RETRIEVE_KEYS) {
					return Promise.reject(errorMessage);
				}
			});

			await expect(
				KeyService.retrieveKeys({ filter: "", limit: 100 }),
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
				key_type: "string",
				ttl: -1,
				memory_usage: 128,
			};

			mockIPC((cmd, args) => {
				if (cmd === COMMANDS.RETRIEVE_KEY) {
					if ((args as { key: string }).key === "user:1") {
						return Promise.resolve<TKey>(mockKey);
					}
				}
			});

			const key = await KeyService.retrieveKey("user:1");
			expect(key).toBeDefined();
			expect(key.key).toBe("user:1");
			expect(key.key_type).toBe("string");
		});

		it("handles key not found", async () => {
			mockIPC((cmd, args) => {
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
