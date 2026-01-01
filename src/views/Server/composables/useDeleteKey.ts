import { ref } from "vue";

export function useDeleteKey(onDelete: (key: TKey["key"]) => Promise<void>) {
	const targetKey = ref<TKey["key"] | null>(null);
	const isDeleteModalOpen = ref(false);

	function beginDeleteKey(key: TKey["key"]) {
		targetKey.value = key;
		isDeleteModalOpen.value = true;
	}

	function cancelDeleteKey() {
		targetKey.value = null;
		isDeleteModalOpen.value = false;
	}

	async function deleteKey() {
		if (!targetKey.value) {
			return;
		}

		await onDelete(targetKey.value);
		cancelDeleteKey();
	}

	return {
		targetKey,
		isDeleteModalOpen,

		beginDeleteKey,
		cancelDeleteKey,
		deleteKey,
	};
}
