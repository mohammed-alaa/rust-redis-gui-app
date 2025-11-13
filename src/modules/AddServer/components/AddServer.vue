<script setup lang="ts">
import { useAddServer } from "../composables/useAddServer";

const emits = defineEmits(["server-added"]);
const { form, error, isLoading, onSubmit } = useAddServer(() =>
	emits("server-added"),
);
</script>

<template>
	<div class="grid place-items-center p-4 h-screen bg-blue-950 text-white">
		<form class="grid gap-4" @submit.prevent="onSubmit">
			{{ error }}
			<div class="grid grid-cols-2 items-center">
				<label for="name">Name:</label>
				<input
					id="name"
					type="text"
					class="border"
					v-model="form.name"
				/>
			</div>

			<div class="grid grid-cols-2 items-center">
				<label for="host">Host:</label>
				<input
					id="host"
					type="text"
					class="border"
					v-model="form.host"
				/>
			</div>

			<div class="grid grid-cols-2 items-center">
				<label for="port">Port:</label>
				<input
					id="port"
					type="number"
					class="border"
					v-model.number="form.port"
				/>
			</div>

			<button
				type="submit"
				class="block w-full border"
				:disabled="isLoading"
			>
				{{ isLoading ? "Connecting..." : "Connect" }}
			</button>
		</form>
	</div>
</template>
