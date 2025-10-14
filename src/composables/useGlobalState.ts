import { ref, computed } from 'vue';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabaseClient';

// Singleton state
const user = ref<User | null>(null);
const session = ref<Session | null>(null);
const loading = ref(true);
const initialized = ref(false);

export const useGlobalState = () => {
  const isAuthenticated = computed(() => !!user.value);

  const setUser = (newUser: User | null) => {
    user.value = newUser;
  };

  const setSession = (newSession: Session | null) => {
    session.value = newSession;
  };

  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  const initAuth = async () => {
    if (initialized.value) return;
    
    try {
      setLoading(true);
      
      // Get initial session
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
      });

      initialized.value = true;
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    user: computed(() => user.value),
    session: computed(() => session.value),
    loading: computed(() => loading.value),
    isAuthenticated,
    setUser,
    setSession,
    setLoading,
    initAuth,
    signOut,
  };
};