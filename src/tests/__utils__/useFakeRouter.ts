import {
	createRouter,
	createWebHashHistory,
	type RouteRecordRaw,
} from "vue-router";

const defaultRoutes: RouteRecordRaw[] = [
	{ path: "/", name: "home", component: { template: "<div>Home</div>" } },
	{
		path: "/add-server",
		name: "add-server",
		component: { template: "<div>Add Server</div>" },
	},
	{
		path: "/server",
		name: "server",
		component: { template: "<div>Server</div>" },
	},
];

export async function useFakeRouter(
	initialRoute = "/",
	routes = defaultRoutes,
) {
	const router = createRouter({
		history: createWebHashHistory(),
		routes,
	});

	// Navigate to initial route and wait for it to be ready
	router.push(initialRoute);
	await router.isReady();

	return router;
}
