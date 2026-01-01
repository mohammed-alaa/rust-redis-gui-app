import { describe, it, expect, vi } from "vitest";
import { useDeleteKey } from "@views/Server/composables/useDeleteKey";

describe("useDeleteKey", () => {
	it("opens delete model", () => {
		const { isDeleteModalOpen, beginDeleteKey } = useDeleteKey(async () =>
			Promise.resolve(),
		);
		expect(isDeleteModalOpen.value).toBe(false);
		beginDeleteKey("test");
		expect(isDeleteModalOpen.value).toBe(true);
	});

	it("closes delete model", () => {
		const { isDeleteModalOpen, beginDeleteKey, cancelDeleteKey } =
			useDeleteKey(async () => Promise.resolve());
		beginDeleteKey("test");
		expect(isDeleteModalOpen.value).toBe(true);
		cancelDeleteKey();
		expect(isDeleteModalOpen.value).toBe(false);
	});

	it("deletes key", async () => {
		const mockDeleteFn = vi.fn();

		const { isDeleteModalOpen, beginDeleteKey, deleteKey } =
			useDeleteKey(mockDeleteFn);
		beginDeleteKey("test");
		await deleteKey();
		expect(mockDeleteFn).toHaveBeenCalled();
		expect(isDeleteModalOpen.value).toBe(false);
	});
});
