import { defineStore } from "pinia";
import { ref } from "vue";
import { useGetKeys } from "@composables";

interface TServer {
	name: string;
	host: string;
	port: number;
}

export const useServerStore = defineStore("server-store", () => {
	const isConnected = ref(false);
	const servers = ref<TServer[]>([]);

	const { keys, filter, isLoading: isLoadingKeys, getKeys } = useGetKeys();

	function addServer(server: TServer) {
		servers.value.push(server);
	}

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
