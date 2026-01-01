import { ref } from "vue";
import { defineStore } from "pinia";
import { useLoading } from "@composables";
import { KeyService } from "@services/KeyService";

export const useKeyStore = defineStore("key-store", () => {
	const keys = ref<TKey[]>([]);
	const currentKey = ref<TCurrentKey>();

	const { isLoading, withLoading } = useLoading();

	async function retrieveKeys(filters: TRetrieveFilters) {
		keys.value = await withLoading(async () =>
			KeyService.retrieveKeys(filters),
		);

		return Promise.resolve<TKey[]>(keys.value);
	}

	async function retrieveKey(key: TKey["key"]) {
		currentKey.value = await KeyService.retrieveKey(key);
		return Promise.resolve<TCurrentKey>(currentKey.value);
	}

	async function deleteKey(key: TKey["key"]) {
		return withLoading(async () => KeyService.deleteKey(key)).then(
			async () => {
				currentKey.value = undefined;
			},
		);
	}

	return {
		keys,
		currentKey,
		isLoading,
		retrieveKeys,
		retrieveKey,
		deleteKey,
	};
});
