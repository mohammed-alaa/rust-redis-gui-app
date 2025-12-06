import { reactive } from "vue";
import { z } from "zod";
import { type FormSubmitEvent } from "@nuxt/ui";

interface TOptions {
	onSuccess?: (data: TRetrieveFilters) => void;
}

export function useFilterForm({ onSuccess }: TOptions = {}) {
	const validationSchema = z.object({
		pattern: z.string(),
		limit: z.number(),
	});

	const fields = reactive<TRetrieveFilters>({
		pattern: "",
		limit: 100,
	});

	async function onSubmit(
		event: FormSubmitEvent<z.output<typeof validationSchema>>,
	) {
		onSuccess?.(event.data);
	}

	return {
		fields,
		validationSchema,

		onSubmit,
	};
}
