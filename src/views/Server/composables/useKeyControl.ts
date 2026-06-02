import { useClipboard } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { useKeyStore } from "@stores/useKeyStore";

export function useKeyControl() {
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

	function onEditKey() {
		if (!currentKey.value) {
			return;
		}

		// TODO: Implement key editing functionality
	}

	return {
		onCopy,
		onEditKey,
	};
}
