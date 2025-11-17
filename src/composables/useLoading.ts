import { ref } from "vue";

type TPromiseFn<T> = () => Promise<T>;

export function useLoading(initialValue: boolean = false) {
	const isLoading = ref<boolean>(initialValue);

	async function withLoading<T>(promiseFn: TPromiseFn<T>): Promise<T> {
		isLoading.value = true;

		try {
			return await promiseFn();
		} finally {
			isLoading.value = false;
		}
	}

	return { isLoading, withLoading };
}
