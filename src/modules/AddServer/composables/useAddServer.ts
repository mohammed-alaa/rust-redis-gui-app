import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { COMMANDS, DEFAULT_SERVER } from "@constants";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

export function useAddServer(onSuccess: Function) {
	const isLoading = ref(false);
	const genericError = ref("");
	const formSchema = toTypedSchema(
		z.object({
			name: z.string().min(2).max(50),
			host: z.string().min(2).max(50),
			port: z.number().min(1).max(65535),
		}),
	);

	const form = useForm<typeof DEFAULT_SERVER>({
		validationSchema: formSchema,
		initialValues: { ...DEFAULT_SERVER },
	});

	async function submit(values: typeof DEFAULT_SERVER) {
		genericError.value = "";
		isLoading.value = true;
		try {
			await invoke(COMMANDS.ADD_SERVER, values);

			onSuccess();
		} catch (_error: any) {
			genericError.value = _error;
		} finally {
			isLoading.value = false;
		}
	}

	return {
		form,
		isLoading,
		formSchema,
		genericError,

		onSubmit: form.handleSubmit(submit),
	};
}
