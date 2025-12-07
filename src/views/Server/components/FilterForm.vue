<script setup lang="ts">
import { type Reactive } from "vue";
import { type ZodSchema, type output } from "zod";
import { type FormSubmitEvent } from "@nuxt/ui";

const props = defineProps<{
	validationSchema: ZodSchema<TRetrieveFilters>;
	fields: Reactive<TRetrieveFilters>;
}>();

const emit = defineEmits<{
	"submit:filters": [
		e: FormSubmitEvent<output<typeof props.validationSchema>>,
	];
}>();

function onSubmit(event: FormSubmitEvent<output<ZodSchema<TRetrieveFilters>>>) {
	emit("submit:filters", event);
}
</script>

<template>
	<UForm
		class="space-y-4 filter-form"
		data-testid="filter-keys-form"
		:schema="validationSchema"
		:state="fields"
		@submit="onSubmit"
	>
		<UFormField name="pattern">
			<UInput
				class="w-full"
				placeholder="Filter by pattern (e.g. user:*)"
				data-testid="filter-keys-form-pattern-field"
				v-model="fields.pattern"
			/>
		</UFormField>
	</UForm>
</template>
