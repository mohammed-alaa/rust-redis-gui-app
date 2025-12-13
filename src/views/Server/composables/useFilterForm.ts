import { reactive } from "vue";
import { z } from "zod";
import { type FormSubmitEvent } from "@nuxt/ui";

interface TOptions {
	onSuccess?: (data: TRetrieveFilters) => void;
}

export function useFilterForm({ onSuccess }: TOptions = {}) {
	const validationSchema = z.object({
		pattern: z.string(),
		key_type: z.enum(["all", "string", "hash", "list", "set", "zset"]),
	});

	const fields = reactive<TRetrieveFilters>({
		pattern: "",
		key_type: "all",
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
