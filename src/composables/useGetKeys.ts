import { ref } from "vue";
import { useLoading } from "./useLoading";
import { COMMANDS } from "@constants";
import { invoke } from "@tauri-apps/api/core";

export function useGetKeys() {
	const { isLoading, withLoading } = useLoading();
	const keys = ref<string[]>([]);
	const filter = ref<string>("");

	async function getKeys() {
		keys.value = await withLoading<string[]>(
			invoke(COMMANDS.GET_KEYS, { filter: filter.value }),
		);
	}

	return { isLoading, keys, filter, getKeys };
}
