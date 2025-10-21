import App from "./App.vue";
import i18n from "./translation";
import { createApp } from "vue";
import Antd from "ant-design-vue";
import "@/assets/scss/main.scss";
import "antd-css-utilities/utility.min.css";
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";
import { autoAnimatePlugin } from "@formkit/auto-animate/vue";
import { router } from "@/router/index";
import AuthLayout from "@/layouts/auth.vue";
import DefaultLayout from "@/layouts/default.vue";
import ErrorLayout from "@/layouts/error.vue";

const initApp = async () => {
    try {
        const app = createApp(App);

        const queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: 1000 * 60 * 5,
                    refetchOnWindowFocus: true,
                },
            },
        });

        app.use(router);
        app.use(i18n);
        app.use(Antd);
        app.use(autoAnimatePlugin);
        app.use(VueQueryPlugin, { queryClient });

        app.component("default-layout", DefaultLayout);
        app.component("authentication-layout", AuthLayout);
        app.component("error-layout", ErrorLayout);

        // App will mount immediately, initState() will be called from App.vue
        app.mount("#app");
    } catch (e) {
        alert("Error initializing app");
        throw e;
    }
};

initApp();
