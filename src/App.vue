<script setup lang="ts">
import { onUnmounted } from "vue";
import { RouterView } from "vue-router";
import { check } from "@tauri-apps/plugin-updater";
import { useServerStore } from "@stores/useServerStore";

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
	<UApp>
		<UHeader>
			<template #left>
				<!-- Header Icon (e.g: Back button, etc...) -->
				<div id="header-icon" />
				<!-- Page title (e.g: Home, Add Server, etc..) -->
				<h1 class="text-2xl font-bold" id="header-title" />
				<!-- Anything that goes after the title (e.g: Server info popover) -->
				<div id="header-title-icon" />
			</template>
			<template #toggle>
				<!-- Any button on the right side of the header (e.g: Add Server button) -->
				<div id="header-right">
					<div class="hidden" />
				</div>
			</template>
		</UHeader>
		<UMain as="main">
			<router-view />
		</UMain>
	</UApp>
</template>
