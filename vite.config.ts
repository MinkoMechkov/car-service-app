import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import MotionResolver from "motion-v/resolver";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        [
            vue({
                template: {
                    compilerOptions: {
                        // isCustomElement: (tag) => tag === 'user-bar',
                    },
                },
            }),
        ],
        AutoImport({
            imports: ["vue", "vue-router", "vue-i18n", "@vueuse/core"],
            dts: "src/auto-imports.d.ts",
            dirs: ["src/composables", "src/utils"],
            vueTemplate: true,
        }),
        Components({
            resolvers: [
                AntDesignVueResolver({ importStyle: "less" }),
                MotionResolver(),
            ],
            directoryAsNamespace: true,
            dirs: ["src/components"],
            dts: "src/components.d.ts",
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use "@/assets/scss/vars.scss" as vars;`,
            },
        },
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },
});
