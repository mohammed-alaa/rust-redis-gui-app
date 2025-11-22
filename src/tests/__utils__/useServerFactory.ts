export function useServerFactory() {
	function reandomString(length: number) {
		return Math.random()
			.toString(36)
			.substring(2, 2 + length);
	}

	function validServer() {
		const serverFormFields: TServerFormFields = {
			name: "Local Redis" + reandomString(5),
			address: "127.0.0.1",
			port: 6379,
		};

		return {
			serverFormFields,
			server: {
				...serverFormFields,
				id: reandomString(20),
				created_at: new Date(),
				updated_at: new Date(),
			} as TServer,
		};
	}

	function invalidServer() {
		const serverFormFields: TServerFormFields = {
			name: "",
			address: "invalid-address",
			port: 70000,
		};

		return {
			serverFormFields,
		};
	}

	function initialServer() {
		const serverFormFields: TServerFormFields = {
			name: "",
			address: "",
			port: 1,
		};

		return {
			serverFormFields,
		};
	}

	return {
		validServer,
		invalidServer,
		initialServer,
	};
}
