<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAddServerForm } from "./composables/useAddServerForm";
import ServerForm from "./components/ServerForm.vue";

const router = useRouter();
const toast = useToast();
const { isLoading, fields, validationSchema, onSubmit } = useAddServerForm({
	onSuccess() {
		router.push({ name: "home" });
	},
	onError(error: string) {
		toast.add({
			title: error as string,
			color: "error",
		});
	},
});
</script>

<template>
	<Teleport defer to="#header-icon">
		<RouterLink :to="{ name: 'home' }">
			<UButton aria-label="Go home" icon="tabler:arrow-left" size="sm" />
		</RouterLink>
	</Teleport>
	<Teleport defer to="#header-title"> Add Server </Teleport>
	<UPage>
		<UPageBody class="flex items-center justify-center">
			<ServerForm
				:is-loading="isLoading"
				:validation-schema="validationSchema"
				:fields="fields"
				@submit="onSubmit"
			/>
		</UPageBody>
	</UPage>
</template>
