<script setup lang="ts">
import { onMounted, ref } from "vue";
import { supabase } from "@/utils/supabaseClient";


const clients = ref<any[]>([]);
const errorMsg = ref("");

onMounted(async () => {
    const { data, error } = await supabase.from("clients").select("*");
    if (error) {
        errorMsg.value = error.message;
    } else {
        clients.value = data ?? [];
    }
});

async function addClient() {
    const { data, error } = await supabase
        .from("clients")
        .insert([
            {
                name: "Иван Иванов",
                phone: "0888123456",
                email: "ivan@example.com",
            },
        ]);
    console.log("Insert result:", { data, error });
}
</script>

<template>
    <div class="p-4">
        <h1>Clients test</h1>
        <div v-if="errorMsg">❌ {{ errorMsg }}</div>
        <ul>
            <li v-for="client in clients" :key="client.id">
                {{ client.name }} — {{ client.phone }}
            </li>
        </ul>

        <button
            @click="addClient"
            class="bg-blue-500 text-white px-4 py-2 rounded">
            ➕ Add test client
        </button>
    </div>
</template>
