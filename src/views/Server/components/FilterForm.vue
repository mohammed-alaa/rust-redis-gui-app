<script setup lang="ts">
import { watch, useTemplateRef, type Reactive } from "vue";
import { type ZodSchema, type output } from "zod";
import { type FormSubmitEvent } from "@nuxt/ui";

const FORM_EL_REF_NAME = "form-el-ref";
const ITEMS = [
	{ label: "All", value: "all" },
	{ label: "String", value: "string" },
	{ label: "List", value: "list" },
	{ label: "Set", value: "set" },
	{ label: "Sorted Set", value: "zset" },
	{ label: "Hash", value: "hash" },
] as Array<{ label: string; value: TRetrieveFilters["key_type"] }>;
const formEl = useTemplateRef<HTMLFormElement>(FORM_EL_REF_NAME);
const props = defineProps<{
	validationSchema: ZodSchema<TRetrieveFilters>;
	fields: Reactive<TRetrieveFilters>;
}>();

defineEmits<{
	"submit:filters": [
		e: FormSubmitEvent<output<typeof props.validationSchema>>,
	];
}>();

watch(
	props.fields,
	() => {
		formEl.value?.submit();
	},
	{ deep: true },
);
</script>

<template>
	<UForm
		class="filter-form flex gap-2"
		data-testid="filter-keys-form"
		:schema="validationSchema"
		:state="fields"
		:ref="FORM_EL_REF_NAME"
		@submit="$emit('submit:filters', $event)"
	>
		<UFormField name="pattern" class="flex-1">
			<UInput
				class="w-full"
				placeholder="Filter by pattern (e.g. user:*)"
				data-testid="filter-keys-form-pattern-field"
				v-model="fields.pattern"
			/>
		</UFormField>
		<UFormField name="type">
			<USelect
				arrow
				data-testid="filter-keys-form-key-type-field"
				:items="ITEMS"
				v-model="fields.key_type"
			>
				Filter by type
			</USelect>
		</UFormField>
	</UForm>
</template>
