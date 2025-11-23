import { type RouteRecordRaw } from "vue-router";

export default [
	{
		name: "home",
		path: "/",
		component: () => import("@views/Home/index.vue"),
	},
	{
		name: "add-server",
		path: "/add-server",
		component: () => import("@views/AddServer/index.vue"),
	},
	{
		name: "server",
		path: "/server",
		component: () => import("@views/Server/index.vue"),
	},
] as RouteRecordRaw[];
