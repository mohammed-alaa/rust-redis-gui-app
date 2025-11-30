import { ref } from "vue";
import { useLoading } from "./useLoading";
import { KeyService } from "@services/KeyService";

export function useGetKeys() {
	const { isLoading, withLoading } = useLoading();
	const keys = ref<TKey[]>([]);
	const options = ref<TRetrieveOptions>({
		filter: "",
		limit: 100,
	});

	async function retrieveKeys() {
		keys.value = await withLoading(async () =>
			KeyService.retrieveKeys(options.value),
		);
	}

	async function retrieveKey(key: TKey["key"]) {
		return KeyService.retrieveKey(key);
	}

	return { isLoading, keys, options, retrieveKeys, retrieveKey };
}
