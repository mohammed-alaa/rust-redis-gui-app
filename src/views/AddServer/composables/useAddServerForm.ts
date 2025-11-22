import { computed, ref } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { DEFAULT_SERVER } from "@constants";
import { useServerStore } from "@stores/useServerStore";
import { useLoading } from "@composables";

export function useAddServerForm() {
	const genericError = ref("");
	const formSchema = toTypedSchema(
		z.object({
			name: z
				.string()
				.min(2, "Name must be at least 2 characters")
				.max(50, "Name must not exceed 50 characters"),
			address: z
				.string()
				.min(2, "Address must be at least 2 characters")
				.max(50, "Address must not exceed 50 characters"),
			port: z
				.number()
				.min(1, "Port must be at least 1")
				.max(65535, "Port must not exceed 65535"),
		}),
	);

	const serverStore = useServerStore();
	const { isLoading, withLoading } = useLoading();
	const form = useForm<typeof DEFAULT_SERVER>({
		validationSchema: formSchema,
		initialValues: { ...DEFAULT_SERVER },
	});

	const isFormValid = computed(() => form.meta.value.valid);

	async function submit(values: TServerFormFields) {
		genericError.value = "";

		try {
			return withLoading(() => serverStore.addServer(values));
		} catch (_error: any) {
			genericError.value = _error;
			return Promise.reject(_error);
		}
	}

	return {
		form,
		genericError,
		isLoading,
		isFormValid,

		onSubmit: form.handleSubmit(submit),
	};
}
