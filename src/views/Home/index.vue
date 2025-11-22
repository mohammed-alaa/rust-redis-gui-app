<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useServerStore } from "@stores/useServerStore";
import { Button } from "@components/ui/button";
import {
	Table,
	TableBody,
	TableEmpty,
	TableCell,
	TableHeader,
	TableRow,
	TableHead,
	TableFooter,
} from "@components/ui/table";

const serverStore = useServerStore();
const { servers, isLoading } = storeToRefs(serverStore);

serverStore.getServers();
</script>

<template>
	<div class="w-screen h-screen p-4">
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead> Name </TableHead>
					<TableHead>Address</TableHead>
					<TableHead>Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<template
					v-for="server in servers"
					:key="`servers-server-${server.id}`"
				>
					<TableRow>
						<TableCell class="font-medium">
							{{ server.name }}
						</TableCell>
						<TableCell>
							{{ server.address }}:{{ server.port }}
						</TableCell>
						<TableCell> </TableCell>
					</TableRow>
				</template>
			</TableBody>
			<TableEmpty v-if="isLoading || !servers.length">
				<template v-if="isLoading">
					<p>Loading servers...</p>
				</template>
				<template v-else>
					<p>No servers found.</p>
				</template>
			</TableEmpty>
			<TableFooter>
				<TableRow>
					<TableCell colspan="100%" class="text-center">
						<RouterLink :to="{ name: 'add-server' }">
							<Button>Add Server</Button>
						</RouterLink>
					</TableCell>
				</TableRow>
			</TableFooter>
		</Table>
	</div>
</template>
