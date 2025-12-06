import { expect, describe, it } from "vitest";
import { cn } from "@utils/shadcnUtils";

describe("cn (class name utility)", () => {
	it("combines multiple class strings", () => {
		const result = cn("p-4", "bg-red-500", "text-white");
		expect(result).toBe("p-4 bg-red-500 text-white");
	});

	it("merges conflicting Tailwind classes (last one wins)", () => {
		const result = cn("bg-red-500", "bg-blue-500");
		expect(result).toBe("bg-blue-500");
	});

	it("handles conditional classes via object syntax", () => {
		const result = cn("p-4", { "text-white": true, hidden: false });
		expect(result).toBe("p-4 text-white");
	});

	it("handles array of classes", () => {
		const result = cn(["p-4", "bg-red-500"]);
		expect(result).toBe("p-4 bg-red-500");
	});

	it("handles undefined and null values", () => {
		const result = cn("p-4", undefined, null, "bg-red-500");
		expect(result).toBe("p-4 bg-red-500");
	});

	it("handles empty string inputs", () => {
		const result = cn("p-4", "", "bg-red-500");
		expect(result).toBe("p-4 bg-red-500");
	});

	it("handles no arguments", () => {
		const result = cn();
		expect(result).toBe("");
	});

	it("merges padding classes correctly", () => {
		const result = cn("p-4", "px-8");
		expect(result).toBe("p-4 px-8");
	});

	it("merges margin classes correctly", () => {
		const result = cn("m-4", "m-8");
		expect(result).toBe("m-8");
	});

	it("handles complex combinations", () => {
		const isActive = true;
		const isDisabled = false;
		const result = cn(
			"base-class",
			["flex", "items-center"],
			{
				"text-blue-500": isActive,
				"opacity-50": isDisabled,
			},
			isActive && "font-bold",
		);
		expect(result).toBe("base-class flex items-center text-blue-500 font-bold");
	});
});
