import App from "./App.vue";
import i18n from "./translation";
import { createApp } from "vue";
import { createPinia } from "pinia";
import Antd from "ant-design-vue";
import '@/assets/scss/main.scss';
import 'antd-css-utilities/utility.min.css';
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";
import { router } from "@/router/index";

const initApp = async () => {
    try {
        const app = createApp(App);
        const pinia = createPinia();

        const queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: 1000 * 60 * 5,
                    refetchOnWindowFocus: false,
                },
            },
        });

        app.use(pinia);
        app.use(router);
        app.use(i18n);
        app.use(Antd);
        app.use(VueQueryPlugin, { queryClient });

        // App will mount immediately, initState() will be called from App.vue
        app.mount("#app");
    } catch (e) {
        alert("Error initializing app");
        throw e;
    }
};

initApp();