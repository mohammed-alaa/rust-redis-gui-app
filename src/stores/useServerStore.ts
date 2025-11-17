import { defineStore } from "pinia";
import { ref } from "vue";
import { useGetKeys, useLoading } from "@composables";
import { COMMANDS } from "@constants";
import { invoke } from "@tauri-apps/api/core";

interface TServer {
	name: string;
	address: string;
	port: number;
}

export const useServerStore = defineStore("server-store", () => {
	const isConnected = ref(false);
	const servers = ref<TServer[]>([]);

	const { keys, filter, isLoading: isLoadingKeys, getKeys } = useGetKeys();
	const { isLoading, withLoading } = useLoading();

	async function addServer(server: TServer) {
		servers.value.push(server);
	}

	async function getServers() {
		const _servers = await withLoading<TServer[]>(
			invoke(COMMANDS.GET_SERVERS),
		);

		console.log(_servers);
		servers.value = _servers;
	}

	getServers();

	return {
		isConnected,
		servers,
		keys,
		filter,
		isLoadingKeys,

		getKeys,
		addServer,
	};
});
