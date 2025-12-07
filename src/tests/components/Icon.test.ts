import { expect, describe, it } from "vitest";
import { mount } from "@vue/test-utils";
import Icon from "@components/Icon.vue";

describe("Icon", () => {
	it("renders with icon prop", () => {
		const wrapper = mount(Icon, {
			props: {
				icon: "mdi:home",
			},
		});

		expect(wrapper.exists()).toBe(true);
		expect(wrapper.props("icon")).toBe("mdi:home");
	});

	it("renders with width prop", () => {
		const wrapper = mount(Icon, {
			props: {
				icon: "mdi:heart",
				width: 24,
			},
		});

		expect(wrapper.props("width")).toBe(24);
	});

	it("renders with height prop", () => {
		const wrapper = mount(Icon, {
			props: {
				icon: "mdi:star",
				height: 32,
			},
		});

		expect(wrapper.props("height")).toBe(32);
	});

	it("renders with color prop", () => {
		const wrapper = mount(Icon, {
			props: {
				icon: "mdi:check",
				color: "red",
			},
		});

		expect(wrapper.props("color")).toBe("red");
	});

	it("renders with multiple props", () => {
		const wrapper = mount(Icon, {
			props: {
				icon: "mdi:account",
				width: 20,
				height: 20,
				color: "blue",
			},
		});

		expect(wrapper.exists()).toBe(true);
		expect(wrapper.props("icon")).toBe("mdi:account");
		expect(wrapper.props("width")).toBe(20);
		expect(wrapper.props("height")).toBe(20);
		expect(wrapper.props("color")).toBe("blue");
	});

	it("passes through props to base Icon component", () => {
		const wrapper = mount(Icon, {
			props: {
				icon: "mdi:home",
				rotate: 90,
			},
		});

		expect(wrapper.props("icon")).toBe("mdi:home");
		expect(wrapper.props("rotate")).toBe(90);
	});
});
