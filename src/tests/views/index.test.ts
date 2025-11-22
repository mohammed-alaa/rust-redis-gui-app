import { defineComponent } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHashHistory } from "vue-router";
import { expect, describe, it, afterEach, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { mockIPC } from "@tauri-apps/api/mocks";
import { useServerStore } from "@stores/useServerStore";
import AddServer from "@views/AddServer/index.vue";
import ServerForm from "@views/AddServer/components/ServerForm.vue";
import { COMMANDS } from "@constants";

let componentWrapper: ReturnType<typeof mount>;

describe("AddServer Page", () => {
	beforeEach(() => {
		componentWrapper = mount(AddServer, {
			global: {
				plugins: [
					createPinia(),
					createRouter({
						history: createWebHashHistory(),
						routes: [
							{
								path: "/",
								name: "home",
								component: defineComponent({
									template: "<div>Home</div>",
								}),
							},
						],
					}),
				],
			},
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
		componentWrapper.unmount();
	});

	it("renders AddServer page correctly", async () => {
		expect(componentWrapper.findComponent(ServerForm).exists()).toBe(true);
	});

	it("submits the form and navigates to home on success", async () => {
		const serverFormWrapper = componentWrapper.findComponent(ServerForm);
		mockIPC((cmd) => {
			if (cmd === COMMANDS.ADD_SERVER) {
				return Promise.resolve({
					id: "1",
					name: "Test Server",
					address: "localhost",
					port: 6379,
					created_at: new Date(),
					updated_at: new Date(),
				} as TServer);
			}
		});

		const serverStore = useServerStore();

		// Fill in the form fields
		await serverFormWrapper
			.find('input[data-testid="add-server-form-name-field"]')
			.setValue("Test Server");
		await serverFormWrapper
			.find('input[data-testid="add-server-form-address-field"]')
			.setValue("localhost");
		await serverFormWrapper
			.find('input[data-testid="add-server-form-port-field"]')
			.setValue("6379");

		// Submit the form
		await serverFormWrapper
			.find('form[data-testid="add-server-form"]')
			.trigger("submit.prevent");

		await vi.waitFor(() => {
			expect(componentWrapper.vm.$route.name).toBe("home");
			expect(serverStore.servers.length).toBe(1);
		});
	});
});
