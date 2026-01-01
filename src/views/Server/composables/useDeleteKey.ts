import { ref } from "vue";

export function useDeleteKey(onDelete: (key: string) => Promise<void>) {
	let targetKey: string | null = null;
	const isDeleteModalOpen = ref(false);

	function beginDeleteKey(key: string) {
		targetKey = key;
		isDeleteModalOpen.value = true;
	}

	function cancelDeleteKey() {
		targetKey = null;
		isDeleteModalOpen.value = false;
	}

	async function deleteKey() {
		if (!targetKey) {
			return;
		}

		await onDelete(targetKey);
		targetKey = null;
		isDeleteModalOpen.value = false;
	}

	return {
		isDeleteModalOpen,

		beginDeleteKey,
		cancelDeleteKey,
		deleteKey,
	};
}
