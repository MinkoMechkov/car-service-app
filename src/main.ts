import App from './App.vue';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Antd from 'ant-design-vue';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import { router } from '@/router/index';


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
app.use(Antd);
app.use(router);
app.use(VueQueryPlugin, { queryClient });

app.mount('#app');
