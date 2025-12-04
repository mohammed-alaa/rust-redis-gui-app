import { defineComponent } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHashHistory } from "vue-router";
import { expect, describe, it, afterEach, beforeEach, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { useServerStore } from "@stores/useServerStore";
import { APP_ERROR_CODES, COMMANDS } from "@constants";
import { ServerService } from "@services/ServerService";
import { useServerFactory } from "@test-utils/useServerFactory";
import AddServer from "@views/AddServer/index.vue";
import ServerForm from "@views/AddServer/components/ServerForm.vue";

vi.fn(useToast);

describe("AddServer Page", () => {
	let componentWrapper: ReturnType<typeof mount>;

	beforeEach(() => {
		componentWrapper = mount(AddServer, {
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
		componentWrapper.unmount();
		clearMocks();
		vi.clearAllMocks();
	});

	it("renders AddServer page correctly", async () => {
		expect(componentWrapper.findComponent(AddServer).exists()).toBe(true);
	});

	it("submits the form and navigates to home on success", async () => {
		const serverFormWrapper = componentWrapper.findComponent(ServerForm);
		mockIPC(async (cmd) => {
			if (cmd === COMMANDS.ADD_SERVER) {
				return Promise.resolve(useServerFactory().validServer().server);
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
		await serverFormWrapper.trigger("submit");
		await flushPromises();

		expect(componentWrapper.vm.$route.name).toBe("home");
		expect(serverStore.servers.length).toBe(1);
	});

	it("submits the form and displays error in toast on failure", async () => {
		const errorMessage = ServerService.handleErrorCodes(
			APP_ERROR_CODES.REDIS_FAILED,
		);
		mockIPC(async (cmd) => {
			if (cmd === COMMANDS.ADD_SERVER) {
				return Promise.reject(APP_ERROR_CODES.REDIS_FAILED);
			}
		});

		const serverFormWrapper = componentWrapper.findComponent(ServerForm);

		await serverFormWrapper
			.find('input[data-testid="add-server-form-name-field"]')
			.setValue("Test Server");
		await serverFormWrapper
			.find('input[data-testid="add-server-form-address-field"]')
			.setValue("localhost");
		await serverFormWrapper
			.find('input[data-testid="add-server-form-port-field"]')
			.setValue("6379");

		await serverFormWrapper.trigger("submit");
		await flushPromises();

		expect(
			useToast().toasts.value.findIndex(
				(toast) => toast.title === errorMessage,
			),
		).not.toEqual(-1);
	});
});
