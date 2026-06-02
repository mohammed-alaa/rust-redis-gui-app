import { describe, it, expect, afterEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import DeleteKeyModal from "@views/Server/components/DeleteKeyModal.vue";

describe("DeleteKeyModal", () => {
	let componentWrapper: ReturnType<typeof mount> | null = null;

	afterEach(() => {
		if (componentWrapper) {
			componentWrapper.unmount();
			componentWrapper = null;
		}
	});

	it("mounts", async () => {
		componentWrapper = mount(DeleteKeyModal, {
			props: {
				modelValue: false,
				targetKey: null,
			},
		});
		await flushPromises();
		expect(componentWrapper.exists()).toBe(true);
	});

	it("opens", async () => {
		componentWrapper = mount(DeleteKeyModal, {
			global: {
				renderStubDefaultSlot: true,
			},
			props: {
				targetKey: "testKey",
				modelValue: true,
			},
		});

		expect(componentWrapper.text()).toContain("Delete Key");
		expect(componentWrapper.text()).toContain("testKey");
	});
});
