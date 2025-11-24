<script setup lang="ts">
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { useAddServerForm } from "./composables/useAddServerForm";
import ServerForm from "./components/ServerForm.vue";
import { Button } from "@components/ui/button";

const router = useRouter();
const {
	isLoading,
	isFormValid,
	onSubmit: onAddServerFormSubmit,
} = useAddServerForm();

function goToHomePage() {
	router.push({ name: "home" });
}

async function onSubmit(event: Event) {
	try {
		await onAddServerFormSubmit(event);
		goToHomePage();
	} catch (error) {
		toast.error(error as string);
	}
}
</script>

<template>
	<div class="grid place-items-center p-4 h-screen">
		<div class="flex gap-4 items-center">
			<Button @click="goToHomePage">Back</Button>
			<h1 class="text-2xl flex-1 font-bold">Add Server</h1>
		</div>

		<ServerForm
			:is-loading="isLoading"
			:is-form-valid="isFormValid"
			@submit="onSubmit"
		/>
	</div>
</template>
