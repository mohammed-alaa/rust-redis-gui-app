<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useStore } from "./Store";
import { AddServer } from "@modules/AddServer";

const store = useStore();
const { isConnected, isLoadingKeys, keys, filter } = storeToRefs(store);
</script>

<template>
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
