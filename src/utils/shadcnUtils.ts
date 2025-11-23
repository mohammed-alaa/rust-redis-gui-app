import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines and merges Tailwind CSS class names.
 *
 * Uses `clsx` to conditionally join class values and `tailwind-merge` to resolve Tailwind CSS conflicts.
 *
 * @param {...ClassValue[]} inputs - Class values to combine (strings, arrays, objects).
 * @returns {string} The merged class string.
 *
 * @example
 * // Basic usage
 * cn("p-4", "bg-red-500", { "text-white": true, "hidden": false });
 * // => "p-4 bg-red-500 text-white"
 *
 * // Merging conflicting Tailwind classes
 * cn("bg-red-500", "bg-blue-500");
 * // => "bg-blue-500"
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
