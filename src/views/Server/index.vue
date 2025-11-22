<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useServerStore } from "@stores/useServerStore";
import { Button } from "@components/ui/button";
import { onBeforeUnmount } from "vue";

const router = useRouter();
const serverStore = useServerStore();
const { activeServer, isConnected } = storeToRefs(serverStore);

function onGoHome() {
	router.push({ name: "home" });
}

onBeforeUnmount(() => {
	serverStore.closeServer();
});
</script>

<template>
	<Button @click="onGoHome"> Go Back </Button>
	<h1>Server</h1>
	<p v-if="isConnected">
		Connected to
		<strong>
			{{ activeServer!.name }} - {{ activeServer!.address }}:
			{{ activeServer!.port }}
		</strong>
	</p>
	<p v-else>No active server</p>
</template>
