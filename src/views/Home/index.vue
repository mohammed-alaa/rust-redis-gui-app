<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useServerStore } from "@stores/useServerStore";
import { Button } from "@components/ui/button";

const serverStore = useServerStore();
const { servers } = storeToRefs(serverStore);
</script>

<template>
	<div class="w-screen h-screen grid justify-center">
		<h1>Welcome to Redis GUI</h1>

		<div class="grid grid-cols-1 gap-4">
			<template
				v-for="(server, index) in servers"
				:key="`servers-server-${server.name}-${index}`"
			>
				<div class="card">
					<h2>{{ server.name }}</h2>
					<p>{{ server.host }}:{{ server.port }}</p>
				</div>
			</template>
		</div>

		<RouterLink :to="{ name: 'add-server' }">
			<Button>Add Server</Button>
		</RouterLink>
	</div>
</template>
