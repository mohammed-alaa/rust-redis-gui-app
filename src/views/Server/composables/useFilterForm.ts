import { computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

export function useFilterForm() {
	const formSchema = toTypedSchema(
		z.object({
			pattern: z.string(),
			limit: z.number(),
		}),
	);

	const form = useForm<TRetrieveFilters>({
		validationSchema: formSchema,
		initialValues: {
			pattern: "",
			limit: 100,
		},
	});

	const isFormValid = computed(() => form.meta.value.valid);

	async function submit(values: TRetrieveFilters) {
		return Promise.resolve(values);
	}

	return {
		form,
		isFormValid,

		onSubmit: form.handleSubmit(submit),
	};
}
