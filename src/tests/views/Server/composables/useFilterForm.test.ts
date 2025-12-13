import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { useFilterForm } from "@views/Server/composables/useFilterForm";
import { type FormSubmitEvent } from "@nuxt/ui";
import { type output } from "zod";

describe("useFilterForm", () => {
	it("initializes", () => {
		const { fields, validationSchema } = useFilterForm();

		expectTypeOf(fields).toEqualTypeOf<TRetrieveFilters>();
		expect(validationSchema).toBeDefined();
	});

	it("calls onSuccess callback on form submission", async () => {
		const mockOnSuccess = vi.fn();
		const { validationSchema, onSubmit } = useFilterForm({
			onSuccess: mockOnSuccess,
		});

		const mockEvent = {
			data: {
				pattern: "test*",
				key_type: "string",
			},
		} as unknown as FormSubmitEvent<output<typeof validationSchema>>;

		await onSubmit(mockEvent);

		expect(mockOnSuccess).toHaveBeenCalledWith(mockEvent.data);
	});
});
