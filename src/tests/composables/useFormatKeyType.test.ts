import { describe, it, expect } from "vitest";
import { useFormatKeyType } from "@composables";

describe("useFormatKeyType", () => {
	describe("Short Format", () => {
		const { shortFormat } = useFormatKeyType();

		it("should format 'string' key type", () => {
			expect(shortFormat("string")).toBe("String");
		});

		it("should format 'list' key type", () => {
			expect(shortFormat("list")).toBe("List");
		});

		it("should format 'set' key type", () => {
			expect(shortFormat("set")).toBe("Set");
		});

		it("should format 'zset' key type", () => {
			expect(shortFormat("zset")).toBe("S-Set");
		});

		it("should format 'hash' key type", () => {
			expect(shortFormat("hash")).toBe("Hash");
		});

		it("should return the same key type for unknown types", () => {
			expect(shortFormat("stream" as "string")).toBe("stream");
		});
	});

	describe("Long Format", () => {
		const { longFormat } = useFormatKeyType();

		it("should format 'string' key type", () => {
			expect(longFormat("string")).toBe("String");
		});

		it("should format 'list' key type", () => {
			expect(longFormat("list")).toBe("List");
		});

		it("should format 'set' key type", () => {
			expect(longFormat("set")).toBe("Set");
		});

		it("should format 'zset' key type", () => {
			expect(longFormat("zset")).toBe("Sorted Set");
		});

		it("should format 'hash' key type", () => {
			expect(longFormat("hash")).toBe("Hash");
		});

		it("should return the same key type for unknown types", () => {
			expect(longFormat("stream" as "string")).toBe("stream");
		});
	});
});
