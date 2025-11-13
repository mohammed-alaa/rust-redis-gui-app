import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { COMMANDS, DEFAULT_SERVER } from "@constants";

export function useAddServer(onSuccess: Function) {
	const isLoading = ref(false);
	const error = ref<string | null>(null);
	const form = ref({ ...DEFAULT_SERVER });

	async function onSubmit() {
		error.value = null;
		isLoading.value = true;
		try {
			await invoke(COMMANDS.ADD_SERVER, form.value);

			onSuccess();
		} catch (_error: any) {
			error.value = _error;
		} finally {
			isLoading.value = false;
		}
	}

	return {
		form,
		isLoading,
		error,

		onSubmit,
	};
}
