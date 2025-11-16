<script setup lang="ts">
import { useAddServer } from "../composables/useAddServer";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@components/ui/form";

const emits = defineEmits(["server-added"]);
const { isLoading, genericError, form, onSubmit } = useAddServer(() =>
	emits("server-added"),
);
</script>

<template>
	<div class="grid place-items-center p-4 h-screen">
		<form @submit.prevent="onSubmit">
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
			<FormField bails name="host" v-slot="{ componentField }">
				<FormItem>
					<FormLabel>Host</FormLabel>
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
				:disabled="isLoading || !form.meta.value.valid"
			>
				{{ isLoading ? "Connecting..." : "Connect" }}
			</Button>
		</form>
	</div>
</template>
