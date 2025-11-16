<script setup lang="ts">
import { check } from "@tauri-apps/plugin-updater";

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
</script>

<template>
	<router-view />
</template>
