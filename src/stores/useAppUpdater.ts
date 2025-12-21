import { ref, shallowRef } from "vue";
import { defineStore } from "pinia";
import { check, type Update } from "@tauri-apps/plugin-updater";

type DOWNLOAD_STATUS =
	| "IDLE"
	| "CHECKING_FOR_UPDATES"
	| "NEW_VERSION_AVAILABLE"
	| "DOWNLOADING_UPDATE"
	| "INSTALLING_UPDATE"
	| "READY_TO_INSTALL";

export const useAppUpdater = defineStore("app-updater", () => {
	const updateError = ref<string | null>(null);
	const isModalOpen = ref(false);
	const fullUpdateSize = ref<number | undefined>();
	const downloadedProgress = ref(0);
	const downloadStatus = ref<DOWNLOAD_STATUS>("IDLE");
	const updateResponse = shallowRef<Update | null>(null);

	async function checkForUpdates() {
		// Disable update check in development mode
		if (!import.meta.env.PROD) {
			return;
		}

		try {
			downloadStatus.value = "CHECKING_FOR_UPDATES";
			updateResponse.value = await check({
				timeout: 10000,
			});

			downloadStatus.value =
				null === updateResponse.value
					? "IDLE"
					: "NEW_VERSION_AVAILABLE";
		} catch (error) {
			updateResponse.value = null;
			updateError.value = error as string;
			downloadStatus.value = "IDLE";
		}
	}

	async function downloadAndInstallUpdate() {
		if (!updateResponse.value) {
			return;
		}

		try {
			downloadStatus.value = "DOWNLOADING_UPDATE";
			await updateResponse.value.downloadAndInstall((progress) => {
				if (progress.event === "Started") {
					downloadedProgress.value = 0;
					fullUpdateSize.value = progress.data?.contentLength || 0;
				} else if (progress.event === "Progress") {
					downloadedProgress.value += progress.data.chunkLength;
				} else if (progress.event === "Finished") {
					downloadStatus.value = "INSTALLING_UPDATE";
				}
			});

			downloadStatus.value = "READY_TO_INSTALL";
		} catch (error) {
			updateError.value = error as string;
			downloadStatus.value = "IDLE";
		}
	}

	function openModal() {
		isModalOpen.value = true;
	}

	function closeModal() {
		isModalOpen.value = false;
	}

	return {
		downloadStatus,
		downloadedProgress,
		updateError,
		fullUpdateSize,
		isModalOpen,
		updateResponse,

		checkForUpdates,
		downloadAndInstallUpdate,
		openModal,
		closeModal,
	};
});
