import { ref } from "vue";

export function useFullScreenView() {
	const isViewingInFullscreen = ref(false);

	function onViewInFullscreen() {
		isViewingInFullscreen.value = !isViewingInFullscreen.value;
	}

	return {
		isViewingInFullscreen,
		onViewInFullscreen,
	};
}
