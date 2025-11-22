export function useServerFactory() {
	function validServer() {
		const serverFormFields: TServerFormFields = {
			name: "Local Redis" + Math.random().toString(36).slice(2),
			address: "127.0.0.1",
			port: 6379,
		};

		return {
			serverFormFields,
			server: {
				...serverFormFields,
				id: Math.random().toString(36).substring(2, 15),
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
			port: 0,
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
