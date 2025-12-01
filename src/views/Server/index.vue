<script setup lang="ts">
import { storeToRefs } from "pinia";
import { RouterLink } from "vue-router";
import { useServerStore } from "@stores/useServerStore";
import { useKeyStore } from "@stores/useKeyStore";
import { onBeforeUnmount } from "vue";
import { toast } from "vue-sonner";
import { useFilterForm } from "./composables/useFilterForm";
import { Button } from "@components/ui/button";
import KeysTable from "./components/KeysTable.vue";
import FilterForm from "./components/FilterForm.vue";
import CurrentKeyDetailts from "./components/CurrentKeyDetailts.vue";

const serverStore = useServerStore();
const { activeServer, isConnected } = storeToRefs(serverStore);
const keyStore = useKeyStore();
const { keys, currentKey } = storeToRefs(keyStore);
const { form, onSubmit: onFiltersSubmitted } = useFilterForm();

onBeforeUnmount(() => {
	serverStore.closeServer().catch(() => {
		toast.error("Failed to close the server connection");
	});
});

async function onSubmit(event: Event) {
	try {
		const values = await onFiltersSubmitted(event);
		await keyStore.retrieveKeys(values!);
	} catch (error) {
		toast.error(`${error}`);
	}
}

async function onKeyClick(key: TKey["key"]) {
	try {
		await keyStore.retrieveKey(key);
	} catch (error) {
		toast.error(`${error}`);
	}
}

keyStore.retrieveKeys(form.values).catch((error) => toast.error(`${error}`));
</script>

<template>
	<div class="flex items-center px-4 py-2 bg-muted gap-2">
		<RouterLink :to="{ name: 'home' }">
			<Button> Go Back </Button>
		</RouterLink>
		<h1>Server</h1>
	</div>

	<template v-if="isConnected">
		<div class="p-4">
			<p>
				<span>Active Server: </span>
				<strong>
					{{ activeServer!.name }} - {{ activeServer!.address }}:
					{{ activeServer!.port }}
				</strong>
			</p>

			<div class="grid grid-cols-2 h-full gap-2 flex-wrap max-h-full">
				<div class="flex flex-col gap-2">
					<FilterForm @submit:filters="onSubmit" />
					<KeysTable
						class="flex-1"
						:keys="keys"
						@click:key="onKeyClick"
					/>
				</div>
				<div>
					<CurrentKeyDetailts v-bind="currentKey" />
				</div>
			</div>
		</div>
	</template>
	<template v-else>
		<p>No active server</p>
	</template>
</template>
