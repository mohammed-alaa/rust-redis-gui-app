<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useServerStore } from "@stores/useServerStore";
import { toast } from "vue-sonner";
import Icon from "@components/Icon.vue";
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
const router = useRouter();
const { servers, isLoading } = storeToRefs(serverStore);

async function onOpenServer(serverId: TServer["id"]) {
	try {
		await serverStore.openServer(serverId);
		router.push({ name: "server" });
	} catch (error) {
		toast.error(error as string);
	}
}

serverStore.getServers().catch((error) => toast.error(error as string));
</script>

<template>
	<div class="p-4">
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
						<TableRow
							class="cursor-pointer"
							tabindex="0"
							aria-role="button"
							:aria-label="`Connect to ${server.name}`"
							data-testid="server-row"
							@click="onOpenServer(server.id)"
							@keydown.enter="onOpenServer(server.id)"
						>
							<TableCell class="font-medium">
								{{ server.name }}
							</TableCell>
							<TableCell>
								{{ server.address }}:{{ server.port }}
							</TableCell>
							<TableCell> </TableCell>
						</TableRow>
					</template>
				</template>
			</TableBody>
			<TableFooter>
				<TableRow>
					<TableCell colspan="100%" class="text-center">
						<RouterLink
							:to="{ name: 'add-server' }"
							data-testid="add-server-link"
						>
							<Button data-testid="add-server-button">
								<Icon icon="tabler:plus" />
								Add Server
							</Button>
						</RouterLink>
					</TableCell>
				</TableRow>
			</TableFooter>
		</Table>
	</div>
</template>
