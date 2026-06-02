import { describe, it, expect } from "vitest";
import { useFullScreenView } from "@views/Server/composables/useFullScreenView";

describe("useFullScreenView", () => {
	it("should toggle fullscreen view", () => {
		const { isViewingInFullscreen, onViewInFullscreen } =
			useFullScreenView();
		expect(isViewingInFullscreen.value).toBe(false);
		onViewInFullscreen();
		expect(isViewingInFullscreen.value).toBe(true);
		onViewInFullscreen();
		expect(isViewingInFullscreen.value).toBe(false);
	});
});
