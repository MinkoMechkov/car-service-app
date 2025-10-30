import { ref, computed } from "vue";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabaseClient";

// Singleton state
const user = ref<User | null>(null);
const userId = ref<string | null>(null);
const session = ref<Session | null>(null);
const role = ref<string | null>(null);
const globalLoading = ref(true);
const initialized = ref(false);

export const useGlobalState = () => {
    const isAuthenticated = computed(() => !!user.value);
    const isAdmin = computed(() => role.value === 'admin');
    const isClient = computed(() => role.value === 'client');


    const setUser = (newUser: User | null) => {
        user.value = newUser;
        userId.value = newUser?.id ?? null;
    };
    
    const setSession = (newSession: Session | null) => {
        session.value = newSession;
    };

    const setRole = (newRole: string | null) => {
        role.value = newRole;
    };

    const setGlobalLoading = (value: boolean) => {
        globalLoading.value = value;
    };

    const fetchUserRole = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", userId)
                .single();

            if (error) throw error;
            return data?.role ?? null;
        } catch (err) {
            console.error("Error fetching user role:", err);
            return null;
        }
    };

    const initState = async () => {
        if (initialized.value) return;

        try {
            setGlobalLoading(true);

            // Get initial session
            const {
                data: { session: initialSession },
            } = await supabase.auth.getSession();
            setSession(initialSession);
            setUser(initialSession?.user ?? null);

            // Fetch role if user exists
            if (initialSession?.user) {
                const userRole = await fetchUserRole(initialSession.user.id);
                setRole(userRole);
            }

            // Listen for auth changes (SYNCHRONOUS callback only!)
            supabase.auth.onAuthStateChange((event, newSession) => {
                setSession(newSession);
                setUser(newSession?.user ?? null);

                if (newSession?.user) {
                    // Queue async role fetch outside the callback to avoid deadlock
                    setTimeout(async () => {
                        const userRole = await fetchUserRole(
                            newSession.user.id
                        );
                        setRole(userRole);
                    }, 0);
                } else {
                    setRole(null);
                }
            });

            initialized.value = true;
        } catch (error) {
            console.error("Error initializing auth:", error);
        } finally {
            setGlobalLoading(false);
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setUser(null);
            setSession(null);
            setRole(null);
        } catch (error) {
            console.error("Error signing out:", error);
            throw error;
        }
    };

    return {
        user: computed(() => user.value),
        userId: computed(() => userId.value), 
        session: computed(() => session.value),
        role: computed(() => role.value),
        globalLoading: computed(() => globalLoading.value),
        isAuthenticated,
        isAdmin,
        isClient,
        setUser,
        setSession,
        setRole,
        setGlobalLoading,
        initState,
        signOut,
    };
};
