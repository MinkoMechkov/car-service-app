import { createWebHistory, createRouter, type LocationQueryRaw } from 'vue-router';import qs from 'qs';

const routes = [
    {
        path: '/',
        component: () => import('@/pages/Home.vue'),
         meta: {
            layout: 'default',
        },
    }
]

function parseQuery(query: string): LocationQueryRaw {
    // Assert to match Vue Router's expected type; configure qs options if you need stricter parsing (e.g., { depth: 0 } for flat output)
    return qs.parse(query) as LocationQueryRaw;
}

function stringifyQuery(query: LocationQueryRaw): string {
    return qs.stringify(query, { arrayFormat: 'brackets' });
}

export const router = createRouter({
    history: createWebHistory(),
    // @ts-expect-error qs ParsedQs is incompatible with LocationQueryRaw (wontfix in vue-router)
    parseQuery,
    stringifyQuery,
    routes,
});

router.beforeEach(async (to, from, next) => {
    // before route entry hook
    // permission guards go here etc.
    next();
});

router.afterEach(() => {
    setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, 250);
});