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

defineEmits(["submit"]);
withDefaults(
	defineProps<{
		isLoading: boolean;
		isFormValid: boolean;
		genericError?: string;
	}>(),
	{
		genericError: "",
	},
);
</script>

<template>
	<form class="flex flex-col gap-4" @submit.prevent="$emit('submit')">
		{{ genericError }}

		<FormField bails name="name" v-slot="{ componentField }">
			<FormItem>
				<FormLabel>Name</FormLabel>
				<FormControl>
					<Input
						type="text"
						placeholder="Example: local server"
						v-bind="componentField"
					/>
				</FormControl>
				<FormMessage />
			</FormItem>
		</FormField>
		<FormField bails name="address" v-slot="{ componentField }">
			<FormItem>
				<FormLabel>Address</FormLabel>
				<FormControl>
					<Input
						type="text"
						placeholder="Example: 127.0.0.1"
						v-bind="componentField"
					/>
				</FormControl>
				<FormMessage />
			</FormItem>
		</FormField>
		<FormField bails name="port" v-slot="{ componentField }">
			<FormItem>
				<FormLabel>Port</FormLabel>
				<FormControl>
					<Input
						type="number"
						placeholder="Example: 6379"
						v-bind="componentField"
					/>
				</FormControl>
				<FormMessage />
			</FormItem>
		</FormField>
		<Button
			type="submit"
			class="cursor-pointer"
			:disabled="isLoading || !isFormValid"
		>
			{{ isLoading ? "Connecting..." : "Connect" }}
		</Button>
	</form>
</template>
