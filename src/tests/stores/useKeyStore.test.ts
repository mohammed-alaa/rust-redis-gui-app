import { beforeEach, expect, describe, it, afterEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useKeyStore } from "@stores/useKeyStore";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { APP_ERROR_CODES, COMMANDS } from "@constants";

describe("useKeyStore", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	afterEach(() => {
		clearMocks();
		vi.clearAllMocks();
	});

	describe("retrieve keys", () => {
		it("fetches keys correctly", async () => {
			const mockKeys: TKey[] = [
				{ key: "key1", key_type: "string", ttl: 3600 },
				{ key: "key2", key_type: "hash", ttl: -1 },
			];

			mockIPC((cmd) => {
				if (cmd === COMMANDS.RETRIEVE_KEYS) {
					return mockKeys;
				}
			});

			const keyStore = useKeyStore();

			const loadingKeys = keyStore.retrieveKeys({
				pattern: "*",
				limit: 100,
			});

			expect(keyStore.isLoading).toBe(true);
			await vi.waitFor(async () => loadingKeys);

			expect(keyStore.isLoading).toBe(false);
			await expect(loadingKeys).resolves.toEqual(mockKeys);
			expect(keyStore.keys).toEqual(mockKeys);
		});

		it("handles errors when fetching keys", async () => {
			mockIPC((cmd) => {
				if (cmd === COMMANDS.RETRIEVE_KEYS) {
					throw {
						code: APP_ERROR_CODES.REDIS_FAILED,
					};
				}
			});

			const keyStore = useKeyStore();

			const loadingKeys = keyStore.retrieveKeys({
				pattern: "*",
				limit: 100,
			});

			expect(keyStore.isLoading).toBe(true);
			await vi.waitFor(async () => loadingKeys.catch(() => {}));

			expect(keyStore.isLoading).toBe(false);
			await expect(loadingKeys).rejects.toEqual({
				code: APP_ERROR_CODES.REDIS_FAILED,
			});
			expect(keyStore.keys).toEqual([]);
		});
	});

	describe("retrieve key", () => {
		it("fetches a key correctly", async () => {
			const mockKey: TKey = {
				key: "key1",
				key_type: "string",
				ttl: 3600,
			};

			mockIPC((cmd, args) => {
				if (
					cmd === COMMANDS.RETRIEVE_KEY &&
					((args as TRetrieveFilters)!.key as TKey["key"]) === "key1"
				) {
					return mockKey;
				}
			});

			const keyStore = useKeyStore();

			const loadingKey = keyStore.retrieveKey("key1");

			await vi.waitFor(async () => loadingKey);

			await expect(loadingKey).resolves.toEqual(mockKey);
			expect(keyStore.currentKey).toEqual(mockKey);
		});

		it("handles errors when fetching a key", async () => {
			mockIPC((cmd) => {
				if (cmd === COMMANDS.RETRIEVE_KEY) {
					throw {
						code: APP_ERROR_CODES.REDIS_FAILED,
					};
				}
			});

			const keyStore = useKeyStore();

			const loadingKey = keyStore.retrieveKey("key1");

			await vi.waitFor(async () => loadingKey.catch(() => {}));

			await expect(loadingKey).rejects.toEqual({
				code: APP_ERROR_CODES.REDIS_FAILED,
			});
			expect(keyStore.currentKey).toEqual({
				details: null,
				content: null,
			} as TCurrentKey);
		});
	});
});
