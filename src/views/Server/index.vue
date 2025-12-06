<script setup lang="ts">
import { storeToRefs } from "pinia";
import { RouterLink } from "vue-router";
import { useServerStore } from "@stores/useServerStore";
import { useKeyStore } from "@stores/useKeyStore";
import { onBeforeUnmount } from "vue";
import { useFilterForm } from "./composables/useFilterForm";
import KeysTable from "./components/KeysTable.vue";
import FilterForm from "./components/FilterForm.vue";
import CurrentKeyDetails from "./components/CurrentKeyDetails.vue";

const toast = useToast();
const serverStore = useServerStore();
const { activeServer, isConnected } = storeToRefs(serverStore);
const keyStore = useKeyStore();
const { keys, currentKey } = storeToRefs(keyStore);
const {
	fields,
	validationSchema,
	onSubmit: onFiltersSubmitted,
} = useFilterForm({
	onSuccess: async (values) => {
		try {
			await keyStore.retrieveKeys(values);
		} catch (error) {
			toast.add({
				title: `${error}`,
				color: "error",
			});
		}
	},
});

onBeforeUnmount(() => {
	serverStore.closeServer().catch(() => {
		toast.add({
			title: "Failed to close server connection",
			color: "error",
		});
	});
});

async function onKeyClick(key: TKey["key"]) {
	try {
		await keyStore.retrieveKey(key);
	} catch (error) {
		toast.add({
			title: `${error}`,
			color: "error",
		});
	}
}

keyStore.retrieveKeys(fields).catch((error) =>
	toast.add({
		title: `${error}`,
		color: "error",
	}),
);
</script>

<template>
	<Teleport to="#header-icon">
		<RouterLink :to="{ name: 'home' }">
			<UButton aria-label="Go home" icon="tabler:arrow-left" size="sm" />
		</RouterLink>
	</Teleport>

	<UContainer class="grid grid-cols-2 py-4 gap-4 keys-view-container">
		<template v-if="isConnected">
			<Teleport to="#header-title">
				Server - {{ activeServer!.name }}
			</Teleport>
			<Teleport to="#header-title-icon">
				<UPopover
					arrow
					mode="hover"
					:content="{
						side: 'right',
					}"
				>
					<UButton
						icon="tabler:info-circle"
						color="info"
						class="rounded-full"
						size="sm"
						variant="subtle"
					/>

					<template #content>
						<UContainer class="py-2">
							<p>
								<span>Address: </span>
								<strong>
									{{ activeServer!.address }}:{{
										activeServer!.port
									}}
								</strong>
							</p>
						</UContainer>
					</template>
				</UPopover>
			</Teleport>

			<div class="flex flex-col gap-2 keys-table-container">
				<FilterForm
					:fields="fields"
					:validation-schema="validationSchema"
					@submit:filters="onFiltersSubmitted"
				/>
				<KeysTable :keys="keys" @click:key="onKeyClick" />
			</div>
			<CurrentKeyDetails v-bind="currentKey" />
		</template>
		<template v-else>
			<Teleport to="#header-title"> Server </Teleport>
			<p>No active server</p>
		</template>
	</UContainer>
</template>
