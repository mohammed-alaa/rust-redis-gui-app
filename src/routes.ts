import { type RouteRecordRaw } from "vue-router";

export const routes = [
	{
		name: "home",
		path: "/",
		component: async () => import("@views/Home/index.vue"),
	},
	{
		name: "add-server",
		path: "/add-server",
		component: async () => import("@views/AddServer/index.vue"),
	},
	{
		name: "server",
		path: "/server",
		component: async () => import("@views/Server/index.vue"),
	},
] as RouteRecordRaw[];
