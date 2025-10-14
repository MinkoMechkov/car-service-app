import { createWebHistory, createRouter,  type LocationQueryRaw } from "vue-router";
import qs from "qs";

const routes = [
    {
        path: "/",
        name: "dashboard",
        component: () => import("@/pages/Dashboard.vue"),
    },

    // Clients
    {
        path: "/clients",
        name: "clients",
        component: () => import("@/pages/Clients/ClientsList.vue"),
    },
    {
        path: "/clients/:id",
        name: "client-details",
        component: () => import("@/pages/Clients/ClientDetails.vue"),
    },

    // Vehicles
    {
        path: "/vehicles",
        name: "vehicles",
        component: () => import("@/pages/Vehicles/VehiclesList.vue"),
    },
    {
        path: "/vehicles/:id",
        name: "vehicle-details",
        component: () => import("@/pages/Vehicles/VehicleDetails.vue"),
    },

    // Repairs
    {
        path: "/repairs",
        name: "repairs",
        component: () => import("@/pages/Repairs/RepairsList.vue"),
    },
    {
        path: "/repairs/:id",
        name: "repair-details",
        component: () => import("@/pages/Repairs/RepairDetails.vue"),
    },

    {
        path: "/settings",
        name: "settings",
        component: () => import("@/pages/Settings.vue"),
    },
];

function parseQuery(query: string): LocationQueryRaw {
    // Assert to match Vue Router's expected type; configure qs options if you need stricter parsing (e.g., { depth: 0 } for flat output)
    return qs.parse(query) as LocationQueryRaw;
}

function stringifyQuery(query: LocationQueryRaw): string {
    return qs.stringify(query, { arrayFormat: "brackets" });
}

export const router = createRouter({
    history: createWebHistory(),
    // @ts-expect-error qs ParsedQs is incompatible with LocationQueryRaw (wontfix in vue-router)
    parseQuery,
    stringifyQuery,
    routes,
});

router.beforeEach((to, from, next) => {
    const { isAuthenticated } = useGlobalState();
    if (to.name !== "Login" && !isAuthenticated.value) next({ name: "Login" });
    else next();
});

router.afterEach(() => {
    setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }, 250);
});
