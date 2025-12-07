import { afterEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import CurrentKeyDetails from "@views/Server/components/CurrentKeyDetails.vue";

describe("CurrentKeyDetails Component", () => {
	let componentWrapper: ReturnType<typeof mount>;

	afterEach(() => {
		if (componentWrapper) {
			componentWrapper.unmount();
		}
	});

	it("initializes", () => {
		componentWrapper = mount(CurrentKeyDetails);

		expect(componentWrapper.exists()).toBe(true);
	});
});
