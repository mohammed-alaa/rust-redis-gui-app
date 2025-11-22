<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useServerStore } from "@stores/useServerStore";
import { Button } from "@components/ui/button";

const serverStore = useServerStore();
const { servers, isLoading } = storeToRefs(serverStore);

serverStore.getServers();
</script>

<template>
	<div class="w-screen h-screen grid justify-center">
		<h1>Welcome to Redis GUI</h1>

		<template v-if="isLoading">
			<p>Loading servers...</p>
		</template>
		<template v-else>
			<div class="grid grid-cols-1 gap-2">
				<template
					v-for="server in servers"
					:key="`servers-server-${server.id}`"
				>
					<div class="grid grid-cols-3 items-center justify-betweeny">
						<h2>{{ server.name }}</h2>
						<p>{{ server.address }}:{{ server.port }}</p>
					</div>
				</template>
			</div>
		</template>

		<RouterLink :to="{ name: 'add-server' }">
			<Button>Add Server</Button>
		</RouterLink>
	</div>
</template>
