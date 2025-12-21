<script setup lang="ts">
import { watch } from "vue";
import { storeToRefs } from "pinia";
import { useAppUpdater } from "@stores/useAppUpdater";

const toast = useToast();
const appUpdaterStore = useAppUpdater();
const {
	downloadStatus,
	downloadedProgress,
	fullUpdateSize,
	isModalOpen,
	updateError,
	updateResponse,
} = storeToRefs(appUpdaterStore);

watch(downloadStatus, (newValue) => {
	if (newValue === "READY_TO_INSTALL") {
		toast.add({
			title: "Update downloaded successfully. Please restart the application to apply the update.",
			color: "success",
			duration: 10000,
		});
	}
});
</script>

<template>
	<div
		class="absolute bottom-5 right-5"
		v-if="downloadStatus !== 'IDLE' || updateError"
	>
		<UTooltip
			arrow
			text="Check for app updates"
			:delay-duration="0"
			:content="{
				side: 'left',
			}"
		>
			<UButton
				size="lg"
				class="cursor-pointer rounded-full"
				aria-label="Check for app updates "
				:class="{
					'animate-bounce':
						!isModalOpen &&
						downloadStatus === 'NEW_VERSION_AVAILABLE',
				}"
				:color="
					downloadStatus === 'READY_TO_INSTALL'
						? 'success'
						: updateError && downloadStatus === 'IDLE'
							? 'error'
							: 'info'
				"
				:icon="
					downloadStatus === 'READY_TO_INSTALL'
						? 'lucide:monitor-check'
						: updateError && downloadStatus === 'IDLE'
							? 'lucide:alert-triangle'
							: 'ic:round-browser-updated'
				"
				@click="appUpdaterStore.openModal"
			/>
		</UTooltip>
	</div>

	<UModal
		close
		title="Application Update"
		description="Manage application updates"
		v-model:open="isModalOpen"
	>
		<template #body>
			<div v-if="updateError" class="text-red-600">
				<p>Error during update: {{ updateError }}</p>
			</div>
			<div v-else>
				<template v-if="downloadStatus === 'NEW_VERSION_AVAILABLE'">
					<p>
						<span>A new version is available.</span>
						<br />
						<span>
							Current version:
							<b>{{ updateResponse?.currentVersion }}</b>
						</span>
						<br />
						<span>
							New version:
							<b>{{ updateResponse?.version }}</b>
						</span>
					</p>
					<UButton
						class="mt-4 cursor-pointer"
						@click="appUpdaterStore.downloadAndInstallUpdate"
					>
						Download and Install Update
					</UButton>
				</template>
				<template v-else-if="downloadStatus === 'DOWNLOADING_UPDATE'">
					<p>
						Downloading update... {{ downloadedProgress }} /
						{{ fullUpdateSize }} MB
					</p>
				</template>
				<template v-else-if="downloadStatus === 'INSTALLING_UPDATE'">
					<p>Installing update...</p>
				</template>
				<template v-else-if="downloadStatus === 'READY_TO_INSTALL'">
					<p>
						Update downloaded successfully. Restart the application
						to apply the update.
					</p>
				</template>
			</div>
		</template>
	</UModal>
</template>
