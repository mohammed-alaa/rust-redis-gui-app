interface TServer {
	id: string;
	name: string;
	address: string;
	port: number;
	created_at: Date;
	updated_at: Date;
}

interface TServerFromBackend extends TServer {
	created_at: string;
	updated_at: string;
}
type TServerFormFields = Pick<TServer, "name" | "address" | "port">;
