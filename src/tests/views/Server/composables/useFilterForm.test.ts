import { beforeEach, expect, describe, it, afterEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useFilterForm } from "@views/Server/composables/useFilterForm";
import { defineComponent } from "vue";
import { mount, flushPromises } from "@vue/test-utils";

describe("useFilterForm", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("initialization", () => {
		it("initializes with default values", () => {
			const TestComponent = defineComponent({
				setup() {
					return useFilterForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form } = wrapper.vm;

			expect(form.values.pattern).toBe("");
			expect(form.values.limit).toBe(100);
			wrapper.unmount();
		});

		it("initializes with valid form state", () => {
			const TestComponent = defineComponent({
				setup() {
					return useFilterForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { isFormValid } = wrapper.vm;

			expect(isFormValid).toBe(true);
			wrapper.unmount();
		});
	});

	describe("form validation", () => {
		it("validates pattern as a string", () => {
			const TestComponent = defineComponent({
				setup() {
					return useFilterForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form } = wrapper.vm;

			form.setFieldValue("pattern", "user:*");
			expect(form.values.pattern).toBe("user:*");
			wrapper.unmount();
		});

		it("validates limit as a number", () => {
			const TestComponent = defineComponent({
				setup() {
					return useFilterForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form } = wrapper.vm;

			form.setFieldValue("limit", 50);
			expect(form.values.limit).toBe(50);
			wrapper.unmount();
		});

		it("allows empty pattern", () => {
			const TestComponent = defineComponent({
				setup() {
					return useFilterForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form, isFormValid } = wrapper.vm;

			form.setFieldValue("pattern", "");
			expect(form.values.pattern).toBe("");
			expect(isFormValid).toBe(true);
			wrapper.unmount();
		});
	});

	describe("form submission", () => {
		it("submits valid form data successfully", async () => {
			const TestComponent = defineComponent({
				setup() {
					return useFilterForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form } = wrapper.vm;

			form.setFieldValue("pattern", "test:*");
			form.setFieldValue("limit", 50);

			const submitFn = vi.fn();
			const handleSubmit = form.handleSubmit(submitFn);
			await handleSubmit({} as Event);
			await flushPromises();

			expect(submitFn).toHaveBeenCalledWith(
				expect.objectContaining({
					pattern: "test:*",
					limit: 50,
				}),
				expect.anything(),
			);
			wrapper.unmount();
		});

		it("returns submitted values from onSubmit", async () => {
			const TestComponent = defineComponent({
				setup() {
					return useFilterForm();
				},
				template: `<form @submit.prevent="onSubmit"></form>`,
			});

			const wrapper = mount(TestComponent);
			const { form } = wrapper.vm;

			form.setFieldValue("pattern", "cache:*");
			form.setFieldValue("limit", 25);

			await wrapper.find("form").trigger("submit");
			await flushPromises();

			expect(form.values.pattern).toBe("cache:*");
			expect(form.values.limit).toBe(25);
			wrapper.unmount();
		});
	});

	describe("form validity", () => {
		it("isFormValid updates when form values change", async () => {
			const TestComponent = defineComponent({
				setup() {
					return useFilterForm();
				},
				template: "<div></div>",
			});

			const wrapper = mount(TestComponent);
			const { form, isFormValid } = wrapper.vm;

			// Initially valid
			expect(isFormValid).toBe(true);

			// Update values
			form.setFieldValue("pattern", "new-pattern");
			await flushPromises();

			// Should still be valid
			expect(isFormValid).toBe(true);
			wrapper.unmount();
		});
	});
});
