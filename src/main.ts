import App from "./App.vue";
import i18n from "./translation";
import { createApp } from "vue";
import { ref } from "vue"; // Add this for reactive refs
import { createPinia } from "pinia";
import Antd from "ant-design-vue";
import '@/assets/scss/main.scss';
import 'antd-css-utilities/utility.min.css';
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";
import { router } from "@/router/index";
import { supabase } from "@/utils/supabaseClient";

export const user = ref(null); // Make this reactive and export for composable/useGlobalState

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

        // Initialize global auth state with reactive ref
        const { data: { user: initialUser } } = await supabase.auth.getUser();
        user.value = initialUser;
        app.provide("user", user); // Provide the reactive ref for inject anywhere

        supabase.auth.onAuthStateChange((event, session) => {
            // Skip INITIAL_SESSION logging to reduce noise
            if (event !== "INITIAL_SESSION") {
                console.log("Auth state changed:", event, session?.user);
            }
            // Update reactive ref app-wide
            user.value = session?.user ?? null;
        });

        app.use(router);
        app.use(i18n);
        app.use(pinia);
        app.use(Antd);
        app.use(VueQueryPlugin, { queryClient });

        app.mount("#app");
    } catch (e) {
        alert("Error initializing app");
        throw e;
    }
};

initApp();