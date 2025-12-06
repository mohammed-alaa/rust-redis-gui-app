import { beforeEach, expect, describe, it, afterEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useFilterForm } from "@views/Server/composables/useFilterForm";
import { type FormSubmitEvent } from "@nuxt/ui";

describe("useFilterForm", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("initialization", () => {
		it("initializes with default field values", () => {
			const { fields } = useFilterForm();

			expect(fields.pattern).toBe("");
			expect(fields.limit).toBe(100);
		});

		it("returns a validation schema", () => {
			const { validationSchema } = useFilterForm();

			expect(validationSchema).toBeDefined();
			// Test that schema can parse valid data
			const result = validationSchema.safeParse({ pattern: "test", limit: 50 });
			expect(result.success).toBe(true);
		});

		it("returns an onSubmit function", () => {
			const { onSubmit } = useFilterForm();

			expect(onSubmit).toBeDefined();
			expect(typeof onSubmit).toBe("function");
		});
	});

	describe("field reactivity", () => {
		it("fields are reactive and can be modified", () => {
			const { fields } = useFilterForm();

			fields.pattern = "user:*";
			expect(fields.pattern).toBe("user:*");

			fields.limit = 50;
			expect(fields.limit).toBe(50);
		});

		it("allows empty pattern", () => {
			const { fields } = useFilterForm();

			fields.pattern = "";
			expect(fields.pattern).toBe("");
		});
	});

	describe("validation schema", () => {
		it("validates pattern as a string", () => {
			const { validationSchema } = useFilterForm();

			const result = validationSchema.safeParse({ pattern: "user:*", limit: 100 });
			expect(result.success).toBe(true);
		});

		it("validates limit as a number", () => {
			const { validationSchema } = useFilterForm();

			const result = validationSchema.safeParse({ pattern: "", limit: 50 });
			expect(result.success).toBe(true);
		});

		it("rejects invalid limit type", () => {
			const { validationSchema } = useFilterForm();

			const result = validationSchema.safeParse({ pattern: "", limit: "invalid" });
			expect(result.success).toBe(false);
		});

		it("rejects invalid pattern type", () => {
			const { validationSchema } = useFilterForm();

			const result = validationSchema.safeParse({ pattern: 123, limit: 100 });
			expect(result.success).toBe(false);
		});
	});

	describe("form submission", () => {
		it("calls onSuccess callback with form data on submit", async () => {
			const onSuccessMock = vi.fn();
			const { onSubmit, fields } = useFilterForm({ onSuccess: onSuccessMock });

			fields.pattern = "test:*";
			fields.limit = 50;

			const mockEvent = {
				data: { pattern: "test:*", limit: 50 },
			} as FormSubmitEvent<TRetrieveFilters>;

			await onSubmit(mockEvent);

			expect(onSuccessMock).toHaveBeenCalledWith({ pattern: "test:*", limit: 50 });
		});

		it("does not throw when onSuccess is not provided", async () => {
			const { onSubmit, fields } = useFilterForm();

			fields.pattern = "cache:*";
			fields.limit = 25;

			const mockEvent = {
				data: { pattern: "cache:*", limit: 25 },
			} as FormSubmitEvent<TRetrieveFilters>;

			await expect(onSubmit(mockEvent)).resolves.not.toThrow();
		});
	});

	describe("options", () => {
		it("accepts empty options object", () => {
			expect(() => useFilterForm({})).not.toThrow();
		});

		it("accepts undefined options", () => {
			expect(() => useFilterForm()).not.toThrow();
		});
	});
});
