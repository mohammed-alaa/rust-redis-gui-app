import { reactive } from "vue";
import { z } from "zod";
import { type FormSubmitEvent } from "@nuxt/ui";
import {
	KEY_TYPE_FILTER_ALL,
	KEY_TYPE_FILTER_HASH,
	KEY_TYPE_FILTER_LIST,
	KEY_TYPE_FILTER_SET,
	KEY_TYPE_FILTER_STRING,
	KEY_TYPE_FILTER_ZSET,
} from "@constants";

interface TOptions {
	onSuccess?: (data: TRetrieveFilters) => void;
}

export function useFilterForm({ onSuccess }: TOptions = {}) {
	const validationSchema = z.object({
		pattern: z.string(),
		key_type: z.enum([
			KEY_TYPE_FILTER_ALL,
			KEY_TYPE_FILTER_STRING,
			KEY_TYPE_FILTER_LIST,
			KEY_TYPE_FILTER_SET,
			KEY_TYPE_FILTER_ZSET,
			KEY_TYPE_FILTER_HASH,
		]),
	});

	const fields = reactive<TRetrieveFilters>({
		pattern: "",
		key_type: KEY_TYPE_FILTER_ALL,
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
