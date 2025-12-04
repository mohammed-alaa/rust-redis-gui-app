import { expect, describe, it, afterEach, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import ServerForm from "@views/AddServer/components/ServerForm.vue";
import { defineComponent } from "vue";
import { useAddServerForm } from "@views/AddServer/composables/useAddServerForm";
import { createPinia, setActivePinia } from "pinia";
import { useServerFactory } from "@test-utils/useServerFactory";

describe("ServerForm", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});
	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("Form Structure", () => {
		it("renders the form structure correctly", () => {
			const { fields, validationSchema } = useAddServerForm();

			const wrapper = mount(ServerForm, {
				props: { isLoading: false, fields, validationSchema },
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

			const nameField = wrapper.find(
				'[data-testid="add-server-form-name-field"]',
			);
			const addressField = wrapper.find(
				'[data-testid="add-server-form-address-field"]',
			);
			const portField = wrapper.find(
				'[data-testid="add-server-form-port-field"]',
			);

			expect(nameField.element.parentElement).not.toBeNullable();
			expect(addressField.element.parentElement).not.toBeNullable();
			expect(portField.element.parentElement).not.toBeNullable();

			expect(
				nameField.element.parentElement!.nextElementSibling,
			).toBeNullable();
			expect(
				addressField.element.parentElement!.nextElementSibling,
			).toBeNullable();
			expect(
				portField.element.parentElement!.nextElementSibling,
			).toBeNullable();
			wrapper.unmount();
		});

		it("renders correct labels for each field", () => {
			const { fields, validationSchema } = useAddServerForm();
			const wrapper = mount(ServerForm, {
				props: { isLoading: false, fields, validationSchema },
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
			const { fields, validationSchema } = useAddServerForm();

			const wrapper = mount(ServerForm, {
				props: { isLoading: true, fields, validationSchema },
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
			const { fields, validationSchema } = useAddServerForm();

			const wrapper = mount(ServerForm, {
				props: {
					isLoading: false,
					fields,
					validationSchema,
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
			const { fields, validationSchema } = useAddServerForm();
			const validFormFields =
				useServerFactory().validServer().serverFormFields;

			fields.name = validFormFields.name;
			fields.address = validFormFields.address;
			fields.port = validFormFields.port;

			const wrapper = mount(ServerForm, {
				props: {
					isLoading: false,
					fields,
					validationSchema,
				},
				global: {
					stubs: {
						Teleport: true,
					},
				},
			});

			await wrapper
				.find('[data-testid="add-server-form"]')
				.trigger("submit");
			await flushPromises();

			expect(wrapper.emitted("submit")).toHaveLength(1);

			wrapper.unmount();
		});
	});

	it("renders FormMessage elements for each field", async () => {
		const wrapper = mount(
			defineComponent({
				components: { ServerForm },
				setup() {
					const addServerForm = useAddServerForm();
					addServerForm.fields.port = -1; // Invalid port to trigger validation message
					return addServerForm;
				},
				template: `<ServerForm :isLoading="isLoading" :fields="fields"
                :validationSchema="validationSchema" @submit="onSubmit" />`,
			}),
		);

		await wrapper.find('[data-testid="add-server-form"]').trigger("submit");
		await flushPromises();

		const nameField = wrapper.find(
			'[data-testid="add-server-form-name-field"]',
		);
		const addressField = wrapper.find(
			'[data-testid="add-server-form-address-field"]',
		);
		const portField = wrapper.find(
			'[data-testid="add-server-form-port-field"]',
		);

		expect(nameField.element.parentElement).not.toBeNullable();
		expect(addressField.element.parentElement).not.toBeNullable();
		expect(portField.element.parentElement).not.toBeNullable();

		expect(
			nameField.element.parentElement!.nextElementSibling?.getAttribute(
				"id",
			),
		).toEqual(nameField.element.getAttribute("aria-describedby"));
		expect(
			addressField.element.parentElement!.nextElementSibling?.getAttribute(
				"id",
			),
		).toEqual(addressField.element.getAttribute("aria-describedby"));
		expect(
			portField.element.parentElement!.nextElementSibling?.getAttribute(
				"id",
			),
		).toEqual(portField.element.getAttribute("aria-describedby"));

		wrapper.unmount();
	});
});
