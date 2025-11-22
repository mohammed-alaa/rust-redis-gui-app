import { defineStore } from "pinia";
import { ref } from "vue";
import { useGetKeys, useLoading } from "@composables";
import { ServerService } from "@services/ServerService";

export const useServerStore = defineStore("server-store", () => {
	const servers = ref<TServer[]>([]);

	const { keys, filter, isLoading: isLoadingKeys, getKeys } = useGetKeys();
	const { isLoading, withLoading } = useLoading();

	async function addServer(values: TServerFormFields): Promise<TServer> {
		const server = await ServerService.addServer(values);
		servers.value.push(server);
		return server;
	}

	async function getServers(): Promise<TServer[]> {
		try {
			const _servers = await withLoading(ServerService.getServers);
			servers.value = _servers;

			return _servers;
		} catch (error: any) {
			console.error("Error fetching servers:", error);
			return [];
		}
	}

	function init() {}

	function $reset() {
		servers.value = [];
	}

	return {
		isLoading,

		servers,
		keys,
		filter,
		isLoadingKeys,

		getKeys,
		addServer,
		getServers,
		init,
		$reset,
	};
});
