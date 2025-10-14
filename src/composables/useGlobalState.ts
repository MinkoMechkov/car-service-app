import { ref, computed, onMounted } from "vue";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabaseClient";

export function useGlobalState() {
  const user = ref<User | null>(null);
  const loading = ref(true);

  async function fetchCurrentUser() {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    user.value = currentUser;
    loading.value = false;
  }

  function subscribeToAuthChanges() {
    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ?? null;
      loading.value = false;
    });
  }

  onMounted(() => {
    fetchCurrentUser();
    subscribeToAuthChanges();
  });

  const isAuthenticated = computed(() => !!user.value);
  const isLoading = computed(() => loading.value);

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    signOut,
  };
}