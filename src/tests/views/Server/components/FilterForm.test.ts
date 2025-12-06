import { expect, describe, it, afterEach, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import FilterForm from "@views/Server/components/FilterForm.vue";
import { useFilterForm } from "@views/Server/composables/useFilterForm";
import { createPinia, setActivePinia } from "pinia";

describe("FilterForm", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	function setup() {
		const { fields, validationSchema } = useFilterForm();
		return mount(FilterForm, {
			props: {
				fields,
				validationSchema,
			},
		});
	}

	describe("Rendering", () => {
		it("renders the form with data-testid", () => {
			const wrapper = setup();

			expect(
				wrapper.find('[data-testid="filter-keys-form"]').exists(),
			).toBe(true);

			wrapper.unmount();
		});

		it("renders the pattern input field", () => {
			const wrapper = setup();

			expect(
				wrapper.find('[data-testid="filter-keys-form-pattern-field"]').exists(),
			).toBe(true);

			wrapper.unmount();
		});

		it("renders input with correct placeholder", () => {
			const wrapper = setup();

			const input = wrapper.find('[data-testid="filter-keys-form-pattern-field"]');
			expect(input.attributes("placeholder")).toBe(
				"Filter by pattern (e.g. user:*)",
			);

			wrapper.unmount();
		});
	});

	describe("Form binding", () => {
		it("updates fields when input changes", async () => {
			const { fields, validationSchema } = useFilterForm();
			const wrapper = mount(FilterForm, {
				props: { fields, validationSchema },
			});

			const input = wrapper.find('[data-testid="filter-keys-form-pattern-field"]');
			await input.setValue("user:*");
			await flushPromises();

			expect(fields.pattern).toBe("user:*");

			wrapper.unmount();
		});

		it("reflects initial field values", () => {
			const { fields, validationSchema } = useFilterForm();
			fields.pattern = "cache:*";

			const wrapper = mount(FilterForm, {
				props: { fields, validationSchema },
			});

			const input = wrapper.find('[data-testid="filter-keys-form-pattern-field"]');
			expect((input.element as HTMLInputElement).value).toBe("cache:*");

			wrapper.unmount();
		});
	});

	describe("Form submission", () => {
		it("emits submit:filters event on form submit", async () => {
			const { fields, validationSchema } = useFilterForm();
			fields.pattern = "test:*";

			const wrapper = mount(FilterForm, {
				props: { fields, validationSchema },
			});

			await wrapper.find('[data-testid="filter-keys-form"]').trigger("submit");
			await flushPromises();

			expect(wrapper.emitted("submit:filters")).toBeDefined();

			wrapper.unmount();
		});

		it("emits event with form data", async () => {
			const { fields, validationSchema } = useFilterForm();
			fields.pattern = "session:*";
			fields.limit = 50;

			const wrapper = mount(FilterForm, {
				props: { fields, validationSchema },
			});

			await wrapper.find('[data-testid="filter-keys-form"]').trigger("submit");
			await flushPromises();

			const emitted = wrapper.emitted("submit:filters");
			expect(emitted).toBeDefined();
			expect(emitted![0][0]).toMatchObject({
				data: {
					pattern: "session:*",
					limit: 50,
				},
			});

			wrapper.unmount();
		});
	});
});
