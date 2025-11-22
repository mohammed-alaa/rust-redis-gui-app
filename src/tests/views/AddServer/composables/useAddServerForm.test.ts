import { beforeEach, expect, describe, it, afterEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useServerStore } from "@stores/useServerStore";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { COMMANDS } from "@constants";
import { useAddServerForm } from "@views/AddServer/composables/useAddServerForm";
import { nextTick, defineComponent } from "vue";
import { mount, flushPromises } from "@vue/test-utils";
import { useServerFactory } from "@test-utils/useServerFactory";

describe("useAddServerForm", () => {
	let server: TServer;
	let serverFormFields: TServerFormFields;

	beforeEach(() => {
		const validServer = useServerFactory().validServer();
		server = validServer.server;
		serverFormFields = validServer.serverFormFields;

		setActivePinia(createPinia());
	});

	afterEach(() => {
		clearMocks();
		vi.clearAllMocks();
		server = {} as TServer;
		serverFormFields = {} as TServerFormFields;
	});

	describe("initialization", () => {
		it("initializes with default values", () => {
			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form, genericError, isLoading, isFormValid } = wrapper.vm;

			expect(form.values).toEqual(
				useServerFactory().initialServer().serverFormFields,
			);
			expect(genericError).toBe("");
			expect(isLoading).toBe(false);
			expect(isFormValid).toBe(true);
			wrapper.unmount();
		});

		it("initializes form with correct schema", () => {
			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form } = wrapper.vm;

			expect(form.values).toEqual(
				useServerFactory().initialServer().serverFormFields,
			);
			wrapper.unmount();
		});
	});

	describe("form validation", () => {
		it("validates name field correctly - minimum length", async () => {
			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form } = wrapper.vm;

			form.setFieldValue("name", "A");
			await form.validateField("name");
			await nextTick();

			expect(form.errors.value.name).toBe(
				"Name must be at least 2 characters",
			);
			wrapper.unmount();
		});

		it("validates name field correctly - maximum length", async () => {
			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form } = wrapper.vm;

			form.setFieldValue("name", "A".repeat(51));
			await form.validateField("name");
			await nextTick();

			expect(form.errors.value.name).toBe(
				"Name must not exceed 50 characters",
			);
			wrapper.unmount();
		});

		it("validates name field correctly - valid name", async () => {
			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form } = wrapper.vm;

			form.setFieldValue("name", "Valid Server");
			await form.validateField("name");
			await nextTick();

			expect(form.errors.value.name).toBeUndefined();
			wrapper.unmount();
		});

		it("validates address field correctly - minimum length", async () => {
			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form } = wrapper.vm;

			form.setFieldValue("address", "A");
			await form.validateField("address");
			await nextTick();

			expect(form.errors.value.address).toBe(
				"Address must be at least 2 characters",
			);
			wrapper.unmount();
		});

		it("validates address field correctly - maximum length", async () => {
			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form } = wrapper.vm;

			form.setFieldValue("address", "A".repeat(51));
			await form.validateField("address");
			await nextTick();

			expect(form.errors.value.address).toBe(
				"Address must not exceed 50 characters",
			);
			wrapper.unmount();
		});

		it("validates address field correctly - valid address", async () => {
			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form } = wrapper.vm;

			form.setFieldValue("address", "localhost");
			await form.validateField("address");
			await nextTick();

			expect(form.errors.value.address).toBeUndefined();
			wrapper.unmount();
		});

		it("validates port field correctly - minimum value", async () => {
			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form } = wrapper.vm;

			form.setFieldValue("port", 0);
			await form.validateField("port");
			await nextTick();

			expect(form.errors.value.port).toBe("Port must be at least 1");
			wrapper.unmount();
		});

		it("validates port field correctly - maximum value", async () => {
			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form } = wrapper.vm;

			form.setFieldValue("port", 65536);
			await form.validateField("port");
			await nextTick();

			expect(form.errors.value.port).toBe("Port must not exceed 65535");
			wrapper.unmount();
		});

		it("validates port field correctly - valid port", async () => {
			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form } = wrapper.vm;

			form.setFieldValue("port", 6379);
			await form.validateField("port");
			await nextTick();

			expect(form.errors.value.port).toBeUndefined();
			wrapper.unmount();
		});

		it("updates isFormValid when all fields are valid", async () => {
			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form, isFormValid } = wrapper.vm;

			form.setFieldValue("name", "Test Server");
			form.setFieldValue("address", "localhost");
			form.setFieldValue("port", 6379);
			await form.validate();
			await nextTick();

			expect(isFormValid).toBe(true);
			wrapper.unmount();
		});

		it("isFormValid is false when fields are invalid", async () => {
			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form } = wrapper.vm;

			form.setFieldValue("name", "");
			form.setFieldValue("address", "");
			form.setFieldValue("port", -1);
			await form.validate();
			await nextTick();

			expect(wrapper.vm.isFormValid).toBe(false);
			wrapper.unmount();
		});
	});

	describe("form submission", () => {
		it("submits valid form data successfully", async () => {
			mockIPC((cmd) => {
				if (cmd === COMMANDS.ADD_SERVER) {
					return server;
				}
			});

			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form, onSubmit, genericError } = wrapper.vm;

			form.setFieldValue("name", serverFormFields.name);
			form.setFieldValue("address", serverFormFields.address);
			form.setFieldValue("port", serverFormFields.port);

			await onSubmit();
			await nextTick();

			expect(genericError).toBe("");
			wrapper.unmount();
		});

		it("calls serverStore.addServer with correct values", async () => {
			mockIPC((cmd) => {
				if (cmd === COMMANDS.ADD_SERVER) {
					return server;
				}
			});

			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form, onSubmit } = wrapper.vm;
			const serverStore = useServerStore();
			const addServerSpy = vi.spyOn(serverStore, "addServer");

			form.setFieldValue("name", serverFormFields.name);
			form.setFieldValue("address", serverFormFields.address);
			form.setFieldValue("port", serverFormFields.port);

			await onSubmit();
			await nextTick();

			expect(addServerSpy).toHaveBeenCalledWith(serverFormFields);
			wrapper.unmount();
		});

		it("sets genericError when submission fails", async () => {
			const errorMessage = "Failed to add server";
			mockIPC((cmd) => {
				if (cmd === COMMANDS.ADD_SERVER) {
					return Promise.reject(errorMessage);
				}
			});

			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form, onSubmit } = wrapper.vm;

			form.setFieldValue("name", serverFormFields.name);
			form.setFieldValue("address", serverFormFields.address);
			form.setFieldValue("port", serverFormFields.port);

			try {
				await onSubmit();
			} catch {}

			vi.waitFor(() => {
				expect(wrapper.vm.genericError).toBe(errorMessage);
			});

			wrapper.unmount();
		});

		it("rejects promise when submission fails", async () => {
			const errorMessage = "Failed to add server";
			mockIPC((cmd) => {
				if (cmd === COMMANDS.ADD_SERVER) {
					return Promise.reject(errorMessage);
				}
			});

			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form, onSubmit } = wrapper.vm;

			form.setFieldValue("name", serverFormFields.name);
			form.setFieldValue("address", serverFormFields.address);
			form.setFieldValue("port", serverFormFields.port);

			await expect(onSubmit()).rejects.toBe(errorMessage);
			wrapper.unmount();
		});

		it("clears genericError before submission", async () => {
			mockIPC((cmd) => {
				if (cmd === COMMANDS.ADD_SERVER) {
					return server;
				}
			});

			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form, onSubmit } = wrapper.vm;

			// Set an initial error
			wrapper.vm.genericError = "Previous error";

			form.setFieldValue("name", serverFormFields.name);
			form.setFieldValue("address", serverFormFields.address);
			form.setFieldValue("port", serverFormFields.port);

			await onSubmit();
			await nextTick();

			expect(wrapper.vm.genericError).toBe("");
			wrapper.unmount();
		});

		it("updates isLoading during submission", async () => {
			mockIPC((cmd) => {
				if (cmd === COMMANDS.ADD_SERVER) {
					return new Promise((resolve) => {
						setTimeout(() => resolve(server), 100);
					});
				}
			});

			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);

			expect(wrapper.vm.isLoading).toBe(false);

			const submitPromise = wrapper.vm.onSubmit();

			await flushPromises();
			vi.waitFor(() => {
				expect(wrapper.vm.isLoading).toBe(true);
			});

			await submitPromise;
			expect(wrapper.vm.isLoading).toBe(false);

			wrapper.unmount();
		});
	});

	describe("integration with serverStore", () => {
		it("adds server to store after successful submission", async () => {
			mockIPC((cmd) => {
				if (cmd === COMMANDS.ADD_SERVER) {
					return server;
				}
			});

			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form, onSubmit } = wrapper.vm;
			const serverStore = useServerStore();

			form.setFieldValue("name", serverFormFields.name);
			form.setFieldValue("address", serverFormFields.address);
			form.setFieldValue("port", serverFormFields.port);

			await onSubmit();
			await nextTick();

			expect(serverStore.servers).toContainEqual(server);
			wrapper.unmount();
		});

		it("does not add server to store when submission fails", async () => {
			mockIPC((cmd) => {
				if (cmd === COMMANDS.ADD_SERVER) {
					return Promise.reject("Server error");
				}
			});

			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form, onSubmit } = wrapper.vm;
			const serverStore = useServerStore();

			form.setFieldValue("name", serverFormFields.name);
			form.setFieldValue("address", serverFormFields.address);
			form.setFieldValue("port", serverFormFields.port);

			try {
				await onSubmit();
			} catch {
				// Expected error
			}
			await nextTick();

			expect(serverStore.servers).toEqual([]);
			wrapper.unmount();
		});
	});
});
