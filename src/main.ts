import { createApp } from "vue";
import { createPinia } from "pinia";
import { router } from "./router";
import ui from "@nuxt/ui/vue-plugin";
import App from "./App.vue";
import "./app.css";

createApp(App).use(createPinia()).use(router).use(ui).mount("#app");
