<script setup lang="ts">
import { useRouter } from "vue-router";
import { useServerStore } from "@stores/useServerStore";
import { useAddServer } from "./composables/useAddServer";
import ServerForm from "./components/ServerForm.vue";
import { Button } from "@components/ui/button";

const router = useRouter();
const serverStore = useServerStore();
const { isLoading, genericError, form, onSubmit } = useAddServer((values) => {
	serverStore.addServer(values);
	goBack();
});

function goBack() {
	router.back();
}
</script>

<template>
	<div class="grid place-items-center p-4 h-screen">
		<div class="flex gap-4 items-center">
			<Button @click="goBack">Back</Button>
			<h1 class="text-2xl flex-1 font-bold">Add Server</h1>
		</div>

		<ServerForm
			:is-loading="isLoading"
			:form="form"
			:generic-error="genericError"
			@submit="onSubmit"
		/>
	</div>
</template>
