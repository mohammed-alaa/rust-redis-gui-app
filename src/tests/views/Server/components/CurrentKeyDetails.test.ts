import { expect, describe, it, afterEach, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import CurrentKeyDetails from "@views/Server/components/CurrentKeyDetails.vue";
import { createPinia, setActivePinia } from "pinia";

describe("CurrentKeyDetails", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("Rendering", () => {
		it("renders with default null values", () => {
			const wrapper = mount(CurrentKeyDetails);

			// Should render without errors even with default null props
			expect(wrapper.exists()).toBe(true);

			wrapper.unmount();
		});

		it("renders key details when provided", () => {
			const details: TKey = {
				key: "user:123",
				key_type: "string",
				ttl: 3600,
			};

			const wrapper = mount(CurrentKeyDetails, {
				props: { details, content: null },
			});

			expect(wrapper.text()).toContain("user:123");
			expect(wrapper.text()).toContain("string");
			expect(wrapper.text()).toContain("3600");

			wrapper.unmount();
		});

		it("renders content when provided", () => {
			const content = "Hello, World!";

			const wrapper = mount(CurrentKeyDetails, {
				props: { details: null, content },
			});

			expect(wrapper.text()).toContain("Hello, World!");

			wrapper.unmount();
		});

		it("renders both details and content", () => {
			const details: TKey = {
				key: "cache:data",
				key_type: "hash",
				ttl: -1,
			};
			const content = { field1: "value1", field2: "value2" };

			const wrapper = mount(CurrentKeyDetails, {
				props: { details, content },
			});

			expect(wrapper.text()).toContain("cache:data");
			expect(wrapper.text()).toContain("hash");
			expect(wrapper.text()).toContain("field1");
			expect(wrapper.text()).toContain("value1");

			wrapper.unmount();
		});
	});

	describe("Different content types", () => {
		it("renders string content", () => {
			const wrapper = mount(CurrentKeyDetails, {
				props: {
					details: { key: "str", key_type: "string", ttl: -1 },
					content: "simple string value",
				},
			});

			expect(wrapper.text()).toContain("simple string value");

			wrapper.unmount();
		});

		it("renders object content", () => {
			const wrapper = mount(CurrentKeyDetails, {
				props: {
					details: { key: "hash", key_type: "hash", ttl: -1 },
					content: { name: "John", age: 30 },
				},
			});

			expect(wrapper.text()).toContain("name");
			expect(wrapper.text()).toContain("John");

			wrapper.unmount();
		});

		it("renders array content", () => {
			const wrapper = mount(CurrentKeyDetails, {
				props: {
					details: { key: "list", key_type: "list", ttl: -1 },
					content: ["item1", "item2", "item3"],
				},
			});

			expect(wrapper.text()).toContain("item1");
			expect(wrapper.text()).toContain("item2");
			expect(wrapper.text()).toContain("item3");

			wrapper.unmount();
		});

		it("renders number content", () => {
			const wrapper = mount(CurrentKeyDetails, {
				props: {
					details: { key: "counter", key_type: "string", ttl: -1 },
					content: 42,
				},
			});

			expect(wrapper.text()).toContain("42");

			wrapper.unmount();
		});
	});

	describe("Styling", () => {
		it("has proper CSS classes for layout", () => {
			const wrapper = mount(CurrentKeyDetails, {
				props: { details: null, content: null },
			});

			const container = wrapper.find("div");
			expect(container.classes()).toContain("whitespace-pre-wrap");
			expect(container.classes()).toContain("break-all");
			expect(container.classes()).toContain("overflow-y-auto");
			expect(container.classes()).toContain("key-details");

			wrapper.unmount();
		});
	});
});
