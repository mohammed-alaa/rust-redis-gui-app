import { describe, it, expect, afterEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import FilterForm from "@views/Server/components/FilterForm.vue";
import { useFilterForm } from "@views/Server/composables/useFilterForm";
import { KEY_TYPE_FILTER_ALL } from "@constants";

describe("FilterForm Component", () => {
	let componentWrapper: ReturnType<typeof mount>;

	afterEach(() => {
		if (componentWrapper) {
			componentWrapper.unmount();
		}
	});

	it("initializes", async () => {
		const { fields, validationSchema } = useFilterForm();
		componentWrapper = mount(FilterForm, {
			props: {
				fields,
				validationSchema,
			},
		});
		expect(componentWrapper.exists()).toBe(true);
	});

	it("renders with initial field values", async () => {
		const { fields, validationSchema } = useFilterForm();
		fields.pattern = "cache:*";

		componentWrapper = mount(FilterForm, {
			props: {
				fields,
				validationSchema,
			},
		});

		const input = componentWrapper.find(
			'input[data-testid="filter-keys-form-pattern-field"]',
		);
		expect((input.element as HTMLInputElement).value).toBe("cache:*");
	});

	it("emits submit:filters on form submission", async () => {
		const { fields, validationSchema } = useFilterForm();
		componentWrapper = mount(FilterForm, {
			props: {
				fields,
				validationSchema,
			},
		});

		// Update the input
		const input = componentWrapper.find(
			'input[data-testid="filter-keys-form-pattern-field"]',
		);
		await input.setValue("user:*");

		// Submit the form
		const form = componentWrapper.find('[data-testid="filter-keys-form"]');
		await form.trigger("submit");
		await flushPromises();

		expect(componentWrapper.emitted("submit:filters")).toBeTruthy();
		expect(
			(componentWrapper.emitted("submit:filters")?.[0]?.[0] as any)
				?.data as TRetrieveFilters,
		).toEqual({
			key_type: KEY_TYPE_FILTER_ALL,
			pattern: "user:*",
		} as TRetrieveFilters);
	});

	it("updates fields.pattern when input changes", async () => {
		const { fields, validationSchema } = useFilterForm();

		componentWrapper = mount(FilterForm, {
			props: {
				fields,
				validationSchema,
			},
		});

		const input = componentWrapper.find(
			'input[data-testid="filter-keys-form-pattern-field"]',
		);
		await input.setValue("session:*");

		expect(fields.pattern).toBe("session:*");
	});
});
