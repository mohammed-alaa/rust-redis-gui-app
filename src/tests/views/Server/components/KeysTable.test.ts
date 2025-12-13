import { afterEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import KeysTable from "@views/Server/components/KeysTable.vue";
import { KEY_TYPE_FILTER_ALL, KEY_TYPE_FILTER_STRING } from "@constants";

describe("KeysTable Component", () => {
	let componentWrapper: ReturnType<typeof mount>;

	afterEach(() => {
		if (componentWrapper) {
			componentWrapper.unmount();
		}
	});

	it("initializes", async () => {
		componentWrapper = mount(KeysTable, {
			props: { keys: [], currentKeyType: KEY_TYPE_FILTER_ALL },
		});

		expect(componentWrapper.exists()).toBe(true);
	});

	it("renders with provided keys", async () => {
		const keys: TKey[] = [
			{
				key: "key1",
				key_type: KEY_TYPE_FILTER_STRING,
				ttl: 10,
				ttl_formatted: "10s",
			},
		];

		componentWrapper = mount(KeysTable, {
			props: { keys, currentKeyType: KEY_TYPE_FILTER_ALL },
		});

		const rows = componentWrapper.findAll('[data-testid="keys-table-row"]');
		expect(rows.length).toBe(1);
		expect(rows[0].text()).toContain("key1");
	});

	it("emits select:key when a key is selected", async () => {
		const keys: TKey[] = [
			{
				key: "key1",
				key_type: KEY_TYPE_FILTER_STRING,
				ttl: 10,
				ttl_formatted: "10s",
			},
		];

		componentWrapper = mount(KeysTable, {
			props: { keys, currentKeyType: KEY_TYPE_FILTER_ALL },
		});

		const row = componentWrapper.find('[data-testid="keys-table-row"]');
		await row.trigger("click");

		expect(componentWrapper.emitted("click:key")).toBeTruthy();
		expect(componentWrapper.emitted("click:key")?.[0]).toEqual([
			keys[0].key,
		]);
	});

	it("shows 'No keys found' message when keys list is empty", async () => {
		componentWrapper = mount(KeysTable, {
			props: { keys: [], currentKeyType: KEY_TYPE_FILTER_ALL },
		});

		const message = componentWrapper.find(
			'[data-testid="keys-table-no-keys-message"]',
		);
		expect(message.exists()).toBe(true);
		expect(message.text()).toBe("No keys found.");
	});

	it("hides the key type column if current key type isn't all", async () => {
		const keys: TKey[] = [
			{
				key: "key1",
				key_type: KEY_TYPE_FILTER_STRING,
				ttl: 10,
				ttl_formatted: "10s",
			},
		];

		componentWrapper = mount(KeysTable, {
			props: { keys, currentKeyType: KEY_TYPE_FILTER_ALL },
		});

		let rows = componentWrapper.findAll('[data-testid="keys-table-row"]');
		expect(rows.length).toBe(keys.length);

		componentWrapper.unmount();

		componentWrapper = mount(KeysTable, {
			props: { keys, currentKeyType: KEY_TYPE_FILTER_STRING },
		});

		rows = componentWrapper.findAll('[data-testid="keys-table-row"]');
		expect(
			componentWrapper
				.find("thead")
				.element.firstElementChild?.children.item(0),
		).not.toBeUndefined();

		expect(
			globalThis.getComputedStyle(
				componentWrapper
					.find("thead")
					.element.firstElementChild!.children.item(0)!,
			).display,
		).toBe("none");
	});
});
