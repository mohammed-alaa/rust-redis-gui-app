<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useServerStore } from "@stores/useServerStore";
import {
	Table,
	TableBody,
	TableEmpty,
	TableCell,
	TableHeader,
	TableRow,
	TableHead,
} from "@components/ui/table";

const toast = useToast();
const serverStore = useServerStore();
const router = useRouter();
const { servers, isLoading } = storeToRefs(serverStore);

async function onOpenServer(serverId: TServer["id"]) {
	try {
		await serverStore.openServer(serverId);
		router.push({ name: "server" });
	} catch (error) {
		toast.add({
			title: error as string,
			color: "error",
		});
	}
}

serverStore.getServers().catch((error) =>
	toast.add({
		title: error as string,
		color: "error",
	}),
);
</script>

<template>
	<Teleport to="#header-title"> Servers </Teleport>
	<Teleport to="#header-right">
		<RouterLink :to="{ name: 'add-server' }" data-testid="add-server-link">
			<UButton
				aria-label="Add new server"
				icon="tabler:plus"
				size="sm"
				data-testid="add-server-button"
				label="Server"
			/>
		</RouterLink>
	</Teleport>
	<UContainer>
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead> Name </TableHead>
					<TableHead>Address</TableHead>
					<TableHead>Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableEmpty colspan="100%" v-if="isLoading || !servers.length">
					<template v-if="isLoading">
						<p>Loading servers...</p>
					</template>
					<template v-else>
						<p>No servers found.</p>
					</template>
				</TableEmpty>
				<template v-else>
					<template
						v-for="server in servers"
						:key="`servers-server-${server.id}`"
					>
						<TableRow data-testid="server-row">
							<TableCell class="font-medium">
								{{ server.name }}
							</TableCell>
							<TableCell>
								{{ server.address }}:{{ server.port }}
							</TableCell>
							<TableCell>
								<UButton
									icon="tabler:link"
									size="sm"
									aria-label="Connect to Server"
									data-testid="server-row-action-connect"
									@click="onOpenServer(server.id)"
								/>
							</TableCell>
						</TableRow>
					</template>
				</template>
			</TableBody>
		</Table>
	</UContainer>
</template>
