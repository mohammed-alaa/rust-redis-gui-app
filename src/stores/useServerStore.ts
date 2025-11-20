import { defineStore } from "pinia";
import { ref } from "vue";
import { useGetKeys, useLoading } from "@composables";
import { ServerService } from "@services/ServerService";

export const useServerStore = defineStore("server-store", () => {
	const serverService = new ServerService();
	const servers = ref<TServer[]>([]);

	const { keys, filter, isLoading: isLoadingKeys, getKeys } = useGetKeys();
	const { isLoading, withLoading } = useLoading();

	async function addServer(values: TServerFormFields) {
		try {
			const server = await withLoading(() =>
				serverService.addServer(values),
			);
			servers.value.push(server);

			return server;
		} catch (error: any) {
			return Promise.reject(error);
		}
	}

	async function getServers() {
		const _servers = await withLoading(serverService.getServers);
		servers.value = _servers;

		return _servers;
	}

	function init() {
		getServers();
	}

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
