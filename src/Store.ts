import { defineStore } from "pinia";
import { ref } from "vue";
import { useGetKeys } from "@composables";

export const useStore = defineStore("main-store", () => {
	const isConnected = ref(false);

	const { keys, filter, isLoading: isLoadingKeys, getKeys } = useGetKeys();

	function onConnect() {
		isConnected.value = true;
		getKeys();
	}

	return {
		isConnected,
		keys,
		filter,
		isLoadingKeys,

		onConnect,
		getKeys,
	};
});
