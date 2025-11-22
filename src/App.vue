<script setup lang="ts">
import { onUnmounted } from "vue";
import { RouterView } from "vue-router";
import { check } from "@tauri-apps/plugin-updater";
import { useServerStore } from "@stores/useServerStore";
import { Toaster } from "@components/ui/sonner";

const serverStore = useServerStore();

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

onUnmounted(() => {
	serverStore.$reset();
});

checkFor();
serverStore.init();
</script>

<template>
	<router-view />

	<Toaster
		rich-colors
		close-button
		dir="auto"
		theme="system"
		position="bottom-center"
		:duration="8000"
	/>
</template>
