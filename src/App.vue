<script setup lang="ts">
import { onUnmounted } from "vue";
import { RouterView } from "vue-router";
import { check } from "@tauri-apps/plugin-updater";
import { useServerStore } from "@stores/useServerStore";

const serverStore = useServerStore();
serverStore.init();

async function checkFor() {
	// Disable update check in development mode
	if (!import.meta.env.PROD) {
		return;
	}

	try {
		const updateResponse = await check();
		console.log("updateResponse", updateResponse);
	} catch (error) {
		console.error("Error checking for updates:", error);
	}
}

checkFor();

onUnmounted(() => {
	serverStore.$reset();
});
</script>

<template>
	<router-view />
</template>
