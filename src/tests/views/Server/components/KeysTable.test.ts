import { expect, describe, it, afterEach, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import KeysTable from "@views/Server/components/KeysTable.vue";
import { createPinia, setActivePinia } from "pinia";

describe("KeysTable", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	function createMockKeys(): TKey[] {
		return [
			{ key: "user:1", key_type: "string", ttl: -1 },
			{ key: "session:abc", key_type: "hash", ttl: 3600 },
			{ key: "cache:items", key_type: "list", ttl: 7200 },
		];
	}

	describe("Rendering", () => {
		it("renders table headers correctly", () => {
			const wrapper = mount(KeysTable, {
				props: {
					keys: [],
				},
			});

			expect(wrapper.text()).toContain("Type");
			expect(wrapper.text()).toContain("Key");
			expect(wrapper.text()).toContain("TTL");

			wrapper.unmount();
		});

		it("renders keys in the table", () => {
			const keys = createMockKeys();
			const wrapper = mount(KeysTable, {
				props: { keys },
			});

			expect(wrapper.text()).toContain("user:1");
			expect(wrapper.text()).toContain("string");
			expect(wrapper.text()).toContain("-1");

			expect(wrapper.text()).toContain("session:abc");
			expect(wrapper.text()).toContain("hash");
			expect(wrapper.text()).toContain("3600");

			wrapper.unmount();
		});

		it("renders empty table when no keys provided", () => {
			const wrapper = mount(KeysTable, {
				props: { keys: [] },
			});

			// Should still have headers
			expect(wrapper.text()).toContain("Type");
			expect(wrapper.text()).toContain("Key");
			expect(wrapper.text()).toContain("TTL");

			// But no data rows (only header row)
			const rows = wrapper.findAll("tr");
			expect(rows.length).toBe(1); // Only header row

			wrapper.unmount();
		});
	});

	describe("Events", () => {
		it("emits click:key event when a row is clicked", async () => {
			const keys = createMockKeys();
			const wrapper = mount(KeysTable, {
				props: { keys },
			});

			// Find data rows (skip header)
			const rows = wrapper.findAll("tbody tr");
			expect(rows.length).toBe(3);

			await rows[0].trigger("click");

			expect(wrapper.emitted("click:key")).toBeDefined();
			expect(wrapper.emitted("click:key")![0]).toEqual(["user:1"]);

			wrapper.unmount();
		});

		it("emits correct key value for different rows", async () => {
			const keys = createMockKeys();
			const wrapper = mount(KeysTable, {
				props: { keys },
			});

			const rows = wrapper.findAll("tbody tr");

			await rows[1].trigger("click");
			expect(wrapper.emitted("click:key")![0]).toEqual(["session:abc"]);

			await rows[2].trigger("click");
			expect(wrapper.emitted("click:key")![1]).toEqual(["cache:items"]);

			wrapper.unmount();
		});
	});

	describe("Display", () => {
		it("shows all key types correctly", () => {
			const keys: TKey[] = [
				{ key: "str", key_type: "string", ttl: -1 },
				{ key: "hsh", key_type: "hash", ttl: -1 },
				{ key: "lst", key_type: "list", ttl: -1 },
				{ key: "st", key_type: "set", ttl: -1 },
				{ key: "zst", key_type: "zset", ttl: -1 },
			];

			const wrapper = mount(KeysTable, {
				props: { keys },
			});

			expect(wrapper.text()).toContain("string");
			expect(wrapper.text()).toContain("hash");
			expect(wrapper.text()).toContain("list");
			expect(wrapper.text()).toContain("set");
			expect(wrapper.text()).toContain("zset");

			wrapper.unmount();
		});

		it("displays TTL values correctly", () => {
			const keys: TKey[] = [
				{ key: "no-ttl", key_type: "string", ttl: -1 },
				{ key: "with-ttl", key_type: "string", ttl: 3600 },
				{ key: "short-ttl", key_type: "string", ttl: 60 },
			];

			const wrapper = mount(KeysTable, {
				props: { keys },
			});

			expect(wrapper.text()).toContain("-1");
			expect(wrapper.text()).toContain("3600");
			expect(wrapper.text()).toContain("60");

			wrapper.unmount();
		});
	});
});
