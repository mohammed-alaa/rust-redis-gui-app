import { createPinia } from "pinia";
import { createRouter, createWebHashHistory } from "vue-router";
import { mount } from "@vue/test-utils";
import { describe, it, vi, beforeEach, afterEach, expect } from "vitest";
import { clearMocks } from "@tauri-apps/api/mocks";
import Server from "@views/Server/index.vue";
import { useServerFactory } from "@test-utils/useServerFactory";

describe("Server View", () => {
	let servers: TServer[];
	let componentWrapper: ReturnType<typeof mount>;

	beforeEach(() => {
		servers = Array.from(
			{ length: 3 },
			() => useServerFactory().validServer().server,
		);

		componentWrapper = mount(Server, {
			global: {
				stubs: {
					Teleport: true,
				},
				plugins: [
					createPinia(),
					createRouter({
						history: createWebHashHistory(),
						routes: [
							{
								name: "home",
								path: "/",
								component: async () =>
									import("@views/Home/index.vue"),
							},
							{
								name: "server",
								path: "/server",
								component: Server,
							},
							{
								name: "add-server",
								path: "/add-server",
								component: async () =>
									import("@views/Server/index.vue"),
							},
						],
					}),
				],
			},
		});
	});

	afterEach(() => {
		if (componentWrapper) {
			componentWrapper.unmount();
		}

		servers = [];
		clearMocks();
		vi.clearAllMocks();
	});

	it("should render correctly", async () => {
		expect(componentWrapper.exists()).toBe(true);
	});
});
