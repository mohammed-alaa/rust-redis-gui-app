<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useServerStore } from "@stores/useServerStore";
import { onBeforeUnmount } from "vue";
import { toast } from "vue-sonner";
import { useGetKeys } from "@composables";
import { Button } from "@components/ui/button";
import {
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableHeader,
	TableCell,
} from "@components/ui/table";

const router = useRouter();
const serverStore = useServerStore();
const { getKeys, keys } = useGetKeys();
const { activeServer, isConnected } = storeToRefs(serverStore);

function onGoHome() {
	router.push({ name: "home" });
}

onBeforeUnmount(() => {
	serverStore.closeServer().catch(() => {
		toast.error("Failed to close the server connection");
	});
});

getKeys().catch((error) => toast.error(`${error}`));
</script>

<template>
	<div class="flex items-center px-4 py-2 bg-muted gap-2">
		<Button @click="onGoHome"> Go Back </Button>
		<h1>Server</h1>
	</div>

	<template v-if="isConnected">
		<div class="p-4">
			<p>
				<span>Active Server: </span>
				<strong>
					{{ activeServer!.name }} - {{ activeServer!.address }}:
					{{ activeServer!.port }}
				</strong>
			</p>

			<div
				class="overflow-auto rounded-md border"
				style="max-height: 400px"
			>
				<Table class="table-fixed">
					<colgroup>
						<col width="50%" />
					</colgroup>
					<TableHeader sticky class="bg-muted shadow">
						<TableRow>
							<TableHead class="text-center"> Key </TableHead>
							<TableHead class="text-center"> Type </TableHead>
							<TableHead class="text-center"> TTL </TableHead>
							<TableHead class="text-center">
								Memory Usage
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<template
							v-for="key in keys"
							:key="`keys-key-${key.key}`"
						>
							<TableRow>
								<TableCell>
									<p
										class="break-all truncate hover:line-clamp-2"
										:title="key.key"
									>
										{{ key.key }}
									</p>
								</TableCell>
								<TableCell class="text-center">
									<p>{{ key.key_type }}</p>
								</TableCell>
								<TableCell class="text-center">
									<p>{{ key.ttl }}</p>
								</TableCell>
								<TableCell class="text-center">
									<p>{{ key.memory_usage }}</p>
								</TableCell>
							</TableRow>
						</template>
					</TableBody>
				</Table>
			</div>
		</div>
	</template>
	<template v-else>
		<p>No active server</p>
	</template>
</template>
