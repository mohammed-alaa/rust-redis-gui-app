import { expect, describe, it, afterEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import ServerForm from "@views/AddServer/components/ServerForm.vue";
import { defineComponent } from "vue";
import { useAddServerForm } from "@views/AddServer/composables/useAddServerForm";
import { createPinia, setActivePinia } from "pinia";

describe("ServerForm", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("Form Structure", () => {
		it("renders the form structure correctly", () => {
			const wrapper = mount(ServerForm, {
				props: { isLoading: false, isFormValid: true },
			});

			expect(
				wrapper.find('[data-testid="add-server-form"]').exists(),
			).toBe(true);

			expect(
				wrapper
					.find('[data-testid="add-server-form-name-field"]')
					.exists(),
			).toBe(true);
			expect(
				wrapper
					.find('[data-testid="add-server-form-address-field"]')
					.exists(),
			).toBe(true);
			expect(
				wrapper
					.find('[data-testid="add-server-form-port-field"]')
					.exists(),
			).toBe(true);
			expect(
				wrapper
					.find('[data-testid="add-server-form-submit-button"]')
					.exists(),
			).toBe(true);

			expect(
				wrapper
					.find('[data-testid="add-server-form-name-field-error"]')
					.exists(),
			).toBe(false);
			expect(
				wrapper
					.find('[data-testid="add-server-form-address-field-error"]')
					.exists(),
			).toBe(false);
			expect(
				wrapper
					.find('[data-testid="add-server-form-port-field-error"]')
					.exists(),
			).toBe(false);

			wrapper.unmount();
		});

		it("renders correct labels for each field", () => {
			const wrapper = mount(ServerForm, {
				props: { isLoading: false, isFormValid: true },
			});

			const nameFieldId = wrapper.find(
				'[data-testid="add-server-form-name-field"]',
			).element.id;
			expect(wrapper.find(`[for=${nameFieldId}]`).text()).toBe("Name");

			const addressFieldId = wrapper.find(
				'[data-testid="add-server-form-address-field"]',
			).element.id;
			expect(wrapper.find(`[for=${addressFieldId}]`).text()).toBe(
				"Address",
			);

			const portFieldId = wrapper.find(
				'[data-testid="add-server-form-port-field"]',
			).element.id;
			expect(wrapper.find(`[for=${portFieldId}]`).text()).toBe("Port");

			wrapper.unmount();
		});
	});

	describe("Form Submission", () => {
		it("disables submit button when loading", async () => {
			const wrapper = mount(ServerForm, {
				props: { isLoading: true, isFormValid: true, genericError: "" },
			});

			const submitBtn = wrapper.find(
				'[data-testid="add-server-form-submit-button"]',
			);

			expect(submitBtn.attributes("disabled")).toBeDefined();
			await submitBtn.trigger("click");
			await flushPromises();
			expect(wrapper.emitted("submit")).toBeUndefined(); // No emit when disabled

			wrapper.unmount();
		});

		it("disables submit button when form isn't valid", async () => {
			const wrapper = mount(ServerForm, {
				props: {
					isLoading: false,
					isFormValid: false,
					genericError: "",
				},
			});

			const submitBtn = wrapper.find(
				'[data-testid="add-server-form-submit-button"]',
			);

			expect(submitBtn.attributes("disabled")).toBeDefined();
			await submitBtn.trigger("click");
			await flushPromises();
			expect(wrapper.emitted("submit")).toBeUndefined(); // No emit when disabled

			wrapper.unmount();
		});

		it("emits 'submit' event when clicking enabled submit button", async () => {
			const wrapper = mount(ServerForm, {
				props: {
					isLoading: false,
					isFormValid: true,
					genericError: "",
				},
			});

			const submitBtn = wrapper.find(
				'[data-testid="add-server-form-submit-button"]',
			);
			expect(submitBtn.attributes("disabled")).toBeUndefined();

			await submitBtn.trigger("click");
			expect(submitBtn.element.getAttribute("type")).toBe("submit");
			expect(wrapper.emitted()).haveOwnProperty("click");
			wrapper.unmount();
		});

		it("emits 'submit' event on native form submission", async () => {
			const wrapper = mount(ServerForm, {
				props: {
					isLoading: false,
					isFormValid: true,
					genericError: "",
				},
			});

			await wrapper
				.find('[data-testid="add-server-form"]')
				.trigger("submit");
			expect(wrapper.emitted("submit")).toHaveLength(1);

			wrapper.unmount();
		});
	});

	describe("Generic Error Display", () => {
		it("displays generic error message when provided", async () => {
			const genericError = "Unable to connect to the server.";
			const wrapper = mount(ServerForm, {
				props: { isLoading: false, isFormValid: true, genericError },
			});

			await flushPromises();

			const errorMsg = wrapper
				.find('[data-testid="add-server-form-generic-error"]')
				.text();
			expect(errorMsg).toBe(genericError);

			wrapper.unmount();
		});

		it("hides generic error when not provided", () => {
			const wrapper = mount(ServerForm, {
				props: {
					isLoading: false,
					isFormValid: true,
					genericError: "",
				},
			});

			expect(
				wrapper
					.find('[data-testid="add-server-form-generic-error"]')
					.exists(),
			).toBe(false);

			wrapper.unmount();
		});
	});

	it("renders FormMessage elements for each field", async () => {
		setActivePinia(createPinia());
		const wrapper = mount(
			defineComponent({
				components: { ServerForm },
				setup() {
					return useAddServerForm();
				},
				template: `<ServerForm :isLoading="isLoading" :isFormValid="isFormValid" :genericError="genericError" @submit="onSubmit" />`,
			}),
		);

		wrapper.vm.form.setFieldValue("name", "");
		wrapper.vm.form.setFieldValue("address", "");
		wrapper.vm.form.setFieldValue("port", -1);

		await wrapper.find('[data-testid="add-server-form"]').trigger("submit");
		await flushPromises();
		await vi.waitFor(() => {
			expect(
				wrapper
					.find('[data-testid="add-server-form-name-field-error"]')
					.exists(),
			).toBe(true);
			expect(
				wrapper
					.find('[data-testid="add-server-form-address-field-error"]')
					.exists(),
			).toBe(true);
			expect(
				wrapper
					.find('[data-testid="add-server-form-port-field-error"]')
					.exists(),
			).toBe(true);
		});

		wrapper.unmount();
	});
});
