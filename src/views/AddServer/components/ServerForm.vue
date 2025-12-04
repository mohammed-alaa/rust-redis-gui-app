<script setup lang="ts">
import { type Reactive } from "vue";
import { type ZodSchema, type output } from "zod";
import { type FormSubmitEvent } from "@nuxt/ui";

const props = defineProps<{
	validationSchema: ZodSchema<TServerFormFields>;
	fields: Reactive<TServerFormFields>;
	isLoading: boolean;
}>();

const emit = defineEmits<{
	submit: [e: FormSubmitEvent<output<typeof props.validationSchema>>];
}>();

function onSubmit(
	event: FormSubmitEvent<output<ZodSchema<TServerFormFields>>>,
) {
	emit("submit", event);
}
</script>

<template>
	<UForm
		class="space-y-4"
		data-testid="add-server-form"
		:schema="validationSchema"
		:state="fields"
		@submit="onSubmit"
	>
		<UFormField label="Name" name="name">
			<UInput
				placeholder="Example: local server"
				data-testid="add-server-form-name-field"
				v-model="fields.name"
			/>
		</UFormField>

		<UFormField required label="Address" name="address">
			<UInput
				type="text"
				placeholder="Example: 127.0.0.1"
				data-testid="add-server-form-address-field"
				v-model="fields.address"
			/>
		</UFormField>
		<UFormField required label="Port" name="port">
			<UInput
				type="number"
				placeholder="Example: 6379"
				data-testid="add-server-form-port-field"
				v-model="fields.port"
			/>
		</UFormField>

		<UButton
			type="submit"
			class="cursor-pointer"
			label="Connect"
			data-testid="add-server-form-submit-button"
			:loading="isLoading"
			:disabled="isLoading"
		/>
	</UForm>
</template>
