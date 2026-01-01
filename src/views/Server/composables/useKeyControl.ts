import { ref } from "vue";
import { useClipboard } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { useKeyStore } from "@stores/useKeyStore";

export function useKeyControl() {
	const isViewingInFullscreen = ref(false);

	const toast = useToast();
	const keyStore = useKeyStore();
	const { currentKey } = storeToRefs(keyStore);

	const { copied, copy } = useClipboard({
		legacy: true,
	});

	async function onCopy() {
		if (!currentKey.value) {
			return;
		}

		await copy(currentKey.value.details.key);
		if (copied.value) {
			toast.add({
				icon: "tabler:copy-check-filled",
				description:
					"The key has been successfully copied to your clipboard.",
				color: "success",
				type: "background",
			});
		}
	}

	function onViewInFullscreen() {
		isViewingInFullscreen.value = !isViewingInFullscreen.value;
	}

	function onEditKey() {
		if (!currentKey.value) {
			return;
		}

		// TODO: Implement key editing functionality
	}

	function onDeleteKey() {
		if (!currentKey.value) {
			return;
		}

		// TODO: Implement key deletion functionality
	}

	return {
		isViewingInFullscreen,
		onCopy,
		onViewInFullscreen,
		onEditKey,
		onDeleteKey,
	};
}
