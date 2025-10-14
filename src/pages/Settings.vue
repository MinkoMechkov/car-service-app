<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase } from "@/utils/supabaseClient";

const vehicles = ref<any[]>([]);
const clients = ref<any[]>([]);
const selectedClient = ref<string>("");

onMounted(async () => {
  const { data: clientsData } = await supabase.from("clients").select("id, name");
  clients.value = clientsData ?? [];
});

async function addVehicle() {
  if (!selectedClient.value) {
    alert("Избери клиент!");
    return;
  }

  const { data, error } = await supabase.from("vehicles").insert([
    {
      client_id: selectedClient.value,
      make: "Toyota",
      model: "Corolla",
      year: 2016,
      license_plate: "CA1234AB",
      mileage: 155000,
    },
  ]);
  console.log("Insert vehicle:", { data, error });
}

async function loadVehicles() {
  const { data, error } = await supabase.from("vehicles").select("*");
  vehicles.value = data ?? [];
}
</script>

<template>
  <div class="p-4">
    <h1>Vehicles test</h1>

    <div class="flex gap-2 my-2">
      <select v-model="selectedClient">
        <option disabled value="">Избери клиент</option>
        <option v-for="c in clients" :key="c.id" :value="c.id">
          {{ c.name }}
        </option>
      </select>
      <button @click="addVehicle" class="bg-green-600 text-white px-3 py-1 rounded">
        ➕ Добави тестов автомобил
      </button>
      <button @click="loadVehicles" class="bg-blue-500 text-white px-3 py-1 rounded">
        🔄 Зареди всички
      </button>
    </div>

    <ul>
      <li v-for="v in vehicles" :key="v.id">
        {{ v.make }} {{ v.model }} ({{ v.license_plate }})
      </li>
    </ul>
  </div>
</template>
