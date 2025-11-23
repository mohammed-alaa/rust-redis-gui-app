import { expect, describe, it } from "vitest";
import { useLoading } from "@composables";

describe("useLoading", () => {
	it("initializes", () => {
		const { isLoading } = useLoading();
		expect(isLoading.value).toBe(false);
	});

	it("initializes with different default value", () => {
		const { isLoading } = useLoading(true);
		expect(isLoading.value).toBe(true);
	});

	it("sets isLoading to true while promise is pending and false after it resolves", async () => {
		const { isLoading, withLoading } = useLoading();

		const mockPromise = () =>
			new Promise((resolve) => {
				setTimeout(() => resolve("done"), 100);
			});

		const promise = withLoading(mockPromise);
		expect(isLoading.value).toBe(true);
		await promise;
		expect(isLoading.value).toBe(false);
	});

	it("sets isLoading to true while promise is pending and false after it rejects", async () => {
		const { isLoading, withLoading } = useLoading();

		const mockPromise = () =>
			new Promise((_, reject) => {
				setTimeout(() => reject(new Error("failed")), 100);
			});

		const promise = withLoading(mockPromise);
		expect(isLoading.value).toBe(true);
		try {
			await promise;
		} catch (_) {}

		expect(isLoading.value).toBe(false);
	});

	it("returns the resolved value from the promise", async () => {
		const { withLoading } = useLoading();

		const mockPromise = () =>
			new Promise<string>((resolve) => {
				setTimeout(() => resolve("success"), 100);
			});

		await expect(withLoading(mockPromise)).resolves.toBe("success");
	});

	it("propagates the error from the rejected promise", async () => {
		const { withLoading } = useLoading();

		const mockPromise = () =>
			new Promise<string>((_, reject) => {
				setTimeout(() => reject(new Error("failure")), 100);
			});

		await expect(withLoading(mockPromise)).rejects.toThrowError("failure");
	});
});
