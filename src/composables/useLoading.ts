import { ref } from "vue";

export function useLoading(initialValue: boolean = false) {
	const isLoading = ref<boolean>(initialValue);

	async function withLoading<T>(promise: Promise<T>): Promise<T> {
		isLoading.value = true;

		try {
			return await promise;
		} finally {
			isLoading.value = false;
		}
	}

	return { isLoading, withLoading };
}
