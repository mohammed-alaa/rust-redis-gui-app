<script setup lang="ts">
import { check } from "@tauri-apps/plugin-updater";
import { storeToRefs } from "pinia";
import { useStore } from "./Store";
import { AddServer } from "@modules/AddServer";

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

const store = useStore();
const { isConnected, isLoadingKeys, keys, filter } = storeToRefs(store);
checkFor();
</script>

<template>
	<router-view />
	<template v-if="isConnected">
		<template v-if="isLoadingKeys">
			<p>Loading keys...</p>
		</template>
		<template v-else>
			<form @submit="store.getKeys">
				<input v-model="filter" placeholder="Filter keys..." />
			</form>

			<div class="overflow-y-scroll m-4 p-4 border">
				<ul>
					<template v-for="key in keys" :key="`keys-list-${key}`">
						<li>{{ key }}</li>
					</template>
				</ul>
			</div>
		</template>
	</template>
	<template v-else>
		<AddServer @server-added="store.onConnect" />
	</template>
</template>
