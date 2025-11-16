import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { COMMANDS, DEFAULT_SERVER } from "@constants";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

export function useAddServer(onSuccess: Function) {
	const isLoading = ref(false);
	const error = ref<string | null>(null);
	const form = ref({ ...DEFAULT_SERVER });

	const formSchema = toTypedSchema(
		z.object({
			name: z.string().min(2).max(50),
			host: z.string().min(2).max(50),
			// username: z.string().min(2).max(50),
			port: z.number().min(1).max(65535),
		}),
	);

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
		formSchema,

		onSubmit,
	};
}
