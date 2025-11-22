import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useLoading } from "@composables";
import { ServerService } from "@services/ServerService";

export const useServerStore = defineStore("server-store", () => {
	const activeServer = ref<TServer | null>(null);
	const servers = ref<TServer[]>([]);

	const isConnected = computed(() => null !== activeServer.value);

	const { isLoading, withLoading } = useLoading();

	async function addServer(values: TServerFormFields): Promise<TServer> {
		const server = await ServerService.addServer(values);
		servers.value.push(server);
		return server;
	}

	async function getServers(): Promise<TServer[]> {
		const _servers = await withLoading(ServerService.getServers);
		servers.value = _servers;

		return _servers;
	}

	async function openServer(id: TServer["id"]) {
		if (activeServer.value?.id === id) {
			return activeServer.value;
		}

		const _server = await ServerService.openServer(id);
		activeServer.value = _server;
		return _server;
	}

	async function closeServer() {
		if (!activeServer.value) {
			return;
		}

		await ServerService.closeServer(activeServer.value.id);
		activeServer.value = null;
	}

	function init() {}

	function $reset() {
		servers.value = [];
	}

	return {
		servers,
		activeServer,
		isLoading,
		isConnected,

		addServer,
		getServers,
		openServer,
		closeServer,
		init,
		$reset,
	};
});
