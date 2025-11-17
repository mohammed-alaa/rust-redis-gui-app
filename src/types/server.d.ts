interface TServer {
	id: string;
	name: string;
	address: string;
	port: number;
	created_at: Date;
	updated_at: Date;
}

type TServerFormFields = Pick<TServer, "name" | "address" | "port">;
