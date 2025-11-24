<script setup lang="ts">
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@components/ui/form";

defineEmits<{
	submit: [e: Event];
}>();
defineProps<{
	isLoading: boolean;
	isFormValid: boolean;
}>();
</script>

<template>
	<form
		data-testid="add-server-form"
		class="flex flex-col gap-4"
		@submit.prevent="$emit('submit', $event)"
	>
		<FormField bails name="name" v-slot="{ componentField }">
			<FormItem>
				<FormLabel>Name</FormLabel>
				<FormControl>
					<Input
						type="text"
						placeholder="Example: local server"
						data-testid="add-server-form-name-field"
						v-bind="componentField"
					/>
				</FormControl>
				<FormMessage data-testid="add-server-form-name-field-error" />
			</FormItem>
		</FormField>
		<FormField bails name="address" v-slot="{ componentField }">
			<FormItem>
				<FormLabel>Address</FormLabel>
				<FormControl>
					<Input
						type="text"
						placeholder="Example: 127.0.0.1"
						data-testid="add-server-form-address-field"
						v-bind="componentField"
					/>
				</FormControl>
				<FormMessage
					data-testid="add-server-form-address-field-error"
				/>
			</FormItem>
		</FormField>
		<FormField bails name="port" v-slot="{ componentField }">
			<FormItem>
				<FormLabel>Port</FormLabel>
				<FormControl>
					<Input
						type="number"
						placeholder="Example: 6379"
						data-testid="add-server-form-port-field"
						v-bind="componentField"
					/>
				</FormControl>
				<FormMessage data-testid="add-server-form-port-field-error" />
			</FormItem>
		</FormField>
		<Button
			type="submit"
			class="cursor-pointer"
			:disabled="isLoading || !isFormValid"
			data-testid="add-server-form-submit-button"
		>
			{{ isLoading ? "Connecting..." : "Connect" }}
		</Button>
	</form>
</template>
