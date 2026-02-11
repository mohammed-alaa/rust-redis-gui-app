import { describe, it, expect, vi } from "vitest";
import { useDeleteKey } from "@views/Server/composables/useDeleteKey";

describe("useDeleteKey", () => {
	it("opens delete model", () => {
		const { isDeleteModalOpen, targetKey, beginDeleteKey } = useDeleteKey(
			async () => Promise.resolve(),
		);
		expect(isDeleteModalOpen.value).toBe(false);
		beginDeleteKey("test");
		expect(isDeleteModalOpen.value).toBe(true);
		expect(targetKey.value).toBe("test");
	});

	it("closes delete model", () => {
		const {
			isDeleteModalOpen,
			targetKey,
			beginDeleteKey,
			cancelDeleteKey,
		} = useDeleteKey(async () => Promise.resolve());
		beginDeleteKey("test");
		expect(isDeleteModalOpen.value).toBe(true);
		expect(targetKey.value).toBe("test");
		cancelDeleteKey();
		expect(isDeleteModalOpen.value).toBe(false);
		expect(targetKey.value).toBeNull();
	});

	it("deletes key", async () => {
		const mockDeleteFn = vi.fn();

		const { isDeleteModalOpen, targetKey, beginDeleteKey, deleteKey } =
			useDeleteKey(mockDeleteFn);
		beginDeleteKey("test");
		await deleteKey();
		expect(mockDeleteFn).toHaveBeenCalled();
		expect(isDeleteModalOpen.value).toBe(false);
		expect(targetKey.value).toBeNull();
	});
});
