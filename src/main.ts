import { createApp } from "vue";
import { createPinia } from "pinia";
import { router } from "./router";
import ui from "@nuxt/ui/vue-plugin";
import App from "./App.vue";
import "./app.css";

createApp(App)
	.use(createPinia())
	.use(router)
	// `as any` fixes type error
	// "Argument of type Plugin is not assignable to parameter of type"
	// TODO: Remove `as any` when type error is fixed
	.use(ui as any)
	.mount("#app");
