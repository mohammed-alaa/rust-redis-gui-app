import { expect, describe, it, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import App from "../App.vue";
import { createPinia, setActivePinia } from "pinia";
import { useFakeRouter } from "@test-utils/useFakeRouter";

// Mock the updater plugin
vi.mock("@tauri-apps/plugin-updater", () => ({
	check: vi.fn().mockResolvedValue(null),
}));

describe("App", () => {
	async function setup() {
		return mount(App, {
			global: {
				plugins: [createPinia(), await useFakeRouter()],
				stubs: {
					UApp: {
						template: "<div><slot /></div>",
					},
					UHeader: {
						template:
							"<div><slot name='left' /><slot name='toggle' /></div>",
					},
					UMain: {
						template: "<div><slot /></div>",
					},
				},
			},
		});
	}

	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it("renders the App component", async () => {
		const wrapper = await setup();
		expect(wrapper.exists()).toBe(true);
	});

	it("renders header with teleport targets", async () => {
		const wrapper = await setup();
		expect(wrapper.find("#header-icon").exists()).toBe(true);
		expect(wrapper.find("#header-title").exists()).toBe(true);
		expect(wrapper.find("#header-title-icon").exists()).toBe(true);
		expect(wrapper.find("#header-right").exists()).toBe(true);
	});

	it("renders header title as h1", async () => {
		const wrapper = await setup();
		const title = wrapper.find("#header-title");
		expect(title.element.tagName).toBe("H1");
		expect(title.classes()).toContain("text-2xl");
		expect(title.classes()).toContain("font-bold");
	});

	it("renders router-view for page content", async () => {
		const wrapper = await setup();
		expect(wrapper.findComponent({ name: "RouterView" }).exists()).toBe(true);
	});
});
