import { reactive } from "vue";
import { z } from "zod";
import { useServerStore } from "@stores/useServerStore";
import { useLoading } from "@composables";
import { type FormSubmitEvent } from "@nuxt/ui";

interface TOptions {
	onSuccess?: (data: TServer) => void;
	onError?: (error: any) => void;
}

export function useAddServerForm({
	onSuccess = (__data: TServer): void => {},
	onError = (__error: any): void => {},
}: TOptions = {}) {
	const validationSchema = z.object({
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
	});

	const fields = reactive<TServerFormFields>({
		name: "",
		address: "",
		port: 1,
	});

	const serverStore = useServerStore();
	const { isLoading, withLoading } = useLoading();

	async function onSubmit(
		event: FormSubmitEvent<z.output<typeof validationSchema>>,
	) {
		try {
			const data = await withLoading(async () =>
				serverStore.addServer(event.data),
			);
			onSuccess?.(data);
			return data;
		} catch (error) {
			onError?.(error);
			return {} as TServer;
		}
	}

	return {
		isLoading,
		fields,
		validationSchema,

		onSubmit,
	};
}
