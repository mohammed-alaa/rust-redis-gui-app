<script setup lang="ts">
import { storeToRefs } from "pinia";
import { RouterLink } from "vue-router";
import { useServerStore } from "@stores/useServerStore";
import { useKeyStore } from "@stores/useKeyStore";
import { onBeforeUnmount } from "vue";
import { useFilterForm } from "./composables/useFilterForm";
import { useKeyControl } from "./composables/useKeyControl";
import { useFullScreenView } from "./composables/useFullScreenView";
import { useDeleteKey } from "./composables/useDeleteKey";
import KeysTable from "./components/KeysTable.vue";
import FilterForm from "./components/FilterForm.vue";
import CurrentKeyDetails from "./components/CurrentKeyDetails.vue";
import DeleteKeyModal from "./components/DeleteKeyModal.vue";

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
const { isViewingInFullscreen, onViewInFullscreen } = useFullScreenView();
const {
	targetKey,
	isDeleteModalOpen,
	beginDeleteKey,
	cancelDeleteKey,
	deleteKey,
} = useDeleteKey(async (key) => {
	try {
		await keyStore.deleteKey(key);
		await keyStore.retrieveKeys(fields);
		toast.add({
			title: "Key deleted successfully",
			color: "success",
		});
	} catch (error) {
		toast.add({
			title: `${error}`,
			color: "error",
		});
	}
});
const { onCopy, onEditKey } = useKeyControl();

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

function onDelete() {
	if (!currentKey.value) {
		return;
	}

	beginDeleteKey(currentKey.value!.details.key);
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
		<RouterLink :to="{ name: 'home' }" data-testid="go-home-link">
			<UButton aria-label="Go home" icon="tabler:arrow-left" size="sm" />
		</RouterLink>
	</Teleport>

	<UContainer class="grid py-4 gap-2 keys-view-container">
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
			<FilterForm
				:fields="fields"
				:validation-schema="validationSchema"
				@submit:filters="onFiltersSubmitted"
			/>
			<KeysTable
				:keys="keys"
				:current-key-type="fields.key_type"
				@click:key="onKeyClick"
			/>
			<CurrentKeyDetails
				:current-key="currentKey"
				v-model:fullscreen="isViewingInFullscreen"
				@fullscreen="onViewInFullscreen"
				@copy="onCopy"
				@edit="onEditKey"
				@delete="onDelete"
			/>
		</template>
		<template v-else>
			<Teleport to="#header-title"> Server </Teleport>
			<p>No active server</p>
		</template>
	</UContainer>

	<DeleteKeyModal
		:target-key="targetKey"
		v-model="isDeleteModalOpen"
		@delete:cancel="cancelDeleteKey"
		@delete:confirm="deleteKey"
	/>
</template>
