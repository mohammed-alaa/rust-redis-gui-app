import { ref } from "vue";
import { useLoading } from "./useLoading";
import { KeyService } from "@services/KeyService";

export function useGetKeys() {
	const { isLoading, withLoading } = useLoading();
	const keys = ref<TKey[]>([]);
	const options = ref<TKeyOptions>({
		filter: "",
		limit: 100,
	});

	async function getKeys() {
		keys.value = await withLoading(async () =>
			KeyService.getKeys(options.value),
		);
	}

	return { isLoading, keys, options, getKeys };
}
