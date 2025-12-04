import { beforeEach, expect, describe, it, afterEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { treeifyError } from "zod";
import { useServerStore } from "@stores/useServerStore";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { APP_ERROR_CODES, COMMANDS } from "@constants";
import { useAddServerForm } from "@views/AddServer/composables/useAddServerForm";
import { nextTick, defineComponent, ref } from "vue";
import { mount, flushPromises } from "@vue/test-utils";
import { useServerFactory } from "@test-utils/useServerFactory";
import { ServerService } from "@services/ServerService";

describe("useAddServerForm", () => {
	let validServerFactory: {
		server: TServer;
		serverFormFields: TServerFormFields;
	};
	let invalidServerFactory: {
		serverFormFields: TServerFormFields;
	};

	beforeEach(() => {
		validServerFactory = useServerFactory().validServer();
		invalidServerFactory = useServerFactory().initialServer();

		setActivePinia(createPinia());
	});

	afterEach(() => {
		clearMocks();
		vi.clearAllMocks();
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
			const { fields, isLoading } = wrapper.vm;

			expect(fields).toEqual(invalidServerFactory.serverFormFields);
			expect(isLoading).toBe(false);
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
			const { fields } = wrapper.vm;

			expect(fields).toEqual(invalidServerFactory.serverFormFields);
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
			const { fields, validationSchema } = wrapper.vm;

			fields.name = "A";
			const result = validationSchema.safeParse(fields);

			expect(result.success).toBe(false);

			expect(
				treeifyError(result.error!).properties!.name!.errors,
			).toContain("Name must be at least 2 characters");

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
			const { fields, validationSchema } = wrapper.vm;

			fields.name = "A".repeat(51);
			const result = validationSchema.safeParse(fields);

			expect(result.success).toBe(false);

			expect(
				treeifyError(result.error!).properties!.name!.errors,
			).toContain("Name must not exceed 50 characters");

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
			const { fields, validationSchema } = wrapper.vm;

			fields.name = "Valid Server";
			const result = validationSchema.safeParse(fields);

			expect(result.success).toBe(false);

			expect(
				treeifyError(result.error!).properties!.name?.errors,
			).toBeUndefined();

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
			const { fields, validationSchema } = wrapper.vm;

			fields.address = "A";
			const result = validationSchema.safeParse(fields);

			expect(result.success).toBe(false);

			expect(
				treeifyError(result.error!).properties!.address?.errors,
			).toContain("Address must be at least 2 characters");
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
			const { fields, validationSchema } = wrapper.vm;

			fields.address = "A".repeat(51);
			const result = validationSchema.safeParse(fields);

			expect(result.success).toBe(false);

			expect(
				treeifyError(result.error!).properties!.address?.errors,
			).toContain("Address must not exceed 50 characters");
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
			const { fields, validationSchema } = wrapper.vm;

			fields.address = "localhost";
			const result = validationSchema.safeParse(fields);

			expect(result.success).toBe(false);

			expect(
				treeifyError(result.error!).properties!.address?.errors,
			).toBeUndefined();
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

			const { fields, validationSchema } = wrapper.vm;

			fields.port = 0;
			const result = validationSchema.safeParse(fields);

			expect(result.success).toBe(false);

			expect(
				treeifyError(result.error!).properties!.port?.errors,
			).toContain("Port must be at least 1");

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

			const { fields, validationSchema } = wrapper.vm;

			fields.port = 65536;
			const result = validationSchema.safeParse(fields);

			expect(result.success).toBe(false);

			expect(
				treeifyError(result.error!).properties!.port?.errors,
			).toContain("Port must not exceed 65535");

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
			const { fields, validationSchema } = wrapper.vm;

			fields.port = 6379;
			const result = validationSchema.safeParse(fields);

			expect(result.success).toBe(false);

			expect(
				treeifyError(result.error!).properties!.port?.errors,
			).toBeUndefined();

			wrapper.unmount();
		});
	});

	describe("form submission", () => {
		it("submits valid form data successfully", async () => {
			mockIPC((cmd) => {
				if (cmd === COMMANDS.ADD_SERVER) {
					return validServerFactory.server;
				}
			});

			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { fields, validationSchema } = wrapper.vm;

			fields.name = validServerFactory.serverFormFields.name;
			fields.address = validServerFactory.serverFormFields.address;
			fields.port = validServerFactory.serverFormFields.port;

			expect(validationSchema.parse(fields)).toEqual(
				validServerFactory.serverFormFields,
			);
			wrapper.unmount();
		});

		it("calls serverStore.addServer with correct values", async () => {
			mockIPC((cmd) => {
				if (cmd === COMMANDS.ADD_SERVER) {
					return validServerFactory.server;
				}
			});

			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { fields, validationSchema, onSubmit } = wrapper.vm;
			const serverStore = useServerStore();
			const addServerSpy = vi.spyOn(serverStore, "addServer");

			fields.name = validServerFactory.serverFormFields.name;
			fields.address = validServerFactory.serverFormFields.address;
			fields.port = validServerFactory.serverFormFields.port;

			expect(validationSchema.parse(fields)).toEqual(
				validServerFactory.serverFormFields,
			);

			await onSubmit({
				data: fields,
			} as any);
			await flushPromises();

			expect(addServerSpy).toHaveBeenCalledWith(
				validServerFactory.serverFormFields,
			);
			wrapper.unmount();
		});

		it("rejects promise when submission fails", async () => {
			const errorMessage = ServerService.handleErrorCodes(
				APP_ERROR_CODES.REDIS_FAILED,
			);
			mockIPC(async (cmd) => {
				if (cmd === COMMANDS.ADD_SERVER) {
					return Promise.reject(APP_ERROR_CODES.REDIS_FAILED);
				}
			});

			const TestComponent = defineComponent({
				setup() {
					const errorMessage = ref("");
					const addServerForm = useAddServerForm({
						onError(error) {
							errorMessage.value = error;
						},
					});

					return {
						errorMessage,
						...addServerForm,
					};
				},
				template: "<div>{{errorMessage}}</div>",
			});

			const wrapper = mount(TestComponent);
			const { fields, validationSchema, onSubmit } = wrapper.vm;

			fields.name = validServerFactory.serverFormFields.name;
			fields.address = validServerFactory.serverFormFields.address;
			fields.port = validServerFactory.serverFormFields.port;

			expect(validationSchema.parse(fields)).toEqual(
				validServerFactory.serverFormFields,
			);

			await vi.waitFor(async () =>
				onSubmit({
					data: fields,
				} as any),
			);

			expect(wrapper.text()).toBe(errorMessage);

			wrapper.unmount();
		});

		it("updates isLoading during submission", async () => {
			mockIPC(async (cmd) => {
				if (cmd === COMMANDS.ADD_SERVER) {
					return new Promise((resolve) => {
						setTimeout(
							() => resolve(validServerFactory.server),
							100,
						);
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

			const submitPromise = wrapper.vm.onSubmit({
				data: validServerFactory.serverFormFields,
			} as any);

			await flushPromises();
			void vi.waitFor(() => {
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
					return validServerFactory.server;
				}
			});

			const TestComponent = defineComponent({
				setup() {
					return useAddServerForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { fields, validationSchema, onSubmit } = wrapper.vm;
			const serverStore = useServerStore();

			fields.name = validServerFactory.serverFormFields.name;
			fields.address = validServerFactory.serverFormFields.address;
			fields.port = validServerFactory.serverFormFields.port;

			expect(validationSchema.parse(fields)).toEqual(
				validServerFactory.serverFormFields,
			);

			await onSubmit({
				data: fields,
			} as any);
			await nextTick();

			expect(serverStore.servers).toContainEqual(
				validServerFactory.server,
			);
			wrapper.unmount();
		});

		it("does not add server to store when submission fails", async () => {
			mockIPC(async (cmd) => {
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
			const { fields, validationSchema, onSubmit } = wrapper.vm;
			const serverStore = useServerStore();

			fields.name = validServerFactory.serverFormFields.name;
			fields.address = validServerFactory.serverFormFields.address;
			fields.port = validServerFactory.serverFormFields.port;

			expect(validationSchema.parse(fields)).toEqual(
				validServerFactory.serverFormFields,
			);

			try {
				await onSubmit({
					data: fields,
				} as any);
			} catch {
				// Expected error
			}

			await flushPromises();

			expect(serverStore.servers).toEqual([]);
			wrapper.unmount();
		});
	});
});
