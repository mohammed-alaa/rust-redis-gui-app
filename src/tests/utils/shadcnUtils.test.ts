import { expect, describe, it } from "vitest";
import { cn } from "@utils/shadcnUtils";

describe("shadcnUtils", () => {
	describe("cn", () => {
		it("combines class names", () => {
			expect(cn("class1", "class2")).toBe("class1 class2");
		});

		it("handles conditional classes", () => {
			expect(cn("class1", { class2: true, class3: false })).toBe("class1 class2");
		});

		it("merges conflicting Tailwind classes", () => {
			expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
		});

		it("handles arrays of classes", () => {
			expect(cn(["class1", "class2"], "class3")).toBe("class1 class2 class3");
		});

		it("handles empty inputs", () => {
			expect(cn()).toBe("");
		});

		it("filters falsy values", () => {
			expect(cn("class1", null, undefined, false, "class2")).toBe("class1 class2");
		});

		it("merges padding classes correctly", () => {
			expect(cn("p-4", "p-2")).toBe("p-2");
		});

		it("merges text color classes correctly", () => {
			expect(cn("text-white", "text-black")).toBe("text-black");
		});
	});
});
