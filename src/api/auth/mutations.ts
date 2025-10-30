import { supabase } from "@/utils/supabaseClient";
import type {
    LoginCredentials,
    RegisterCredentials,
    ResetPasswordRequest,
    UpdatePasswordRequest,
} from "./interfaces";

export const authMutations = {
    /**
     * Sign in with email and password
     */
    async login(credentials: LoginCredentials) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });

        if (error) throw error;
        return data;
    },

    /**
     * Register a new user
     */
    async register(credentials: RegisterCredentials) {
        const { data, error } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
                data: {
                    full_name: credentials.fullName,
                    phone: credentials.phone,
                },
            },
        });

        if (error) throw error;
        return data;
    },

    /**
     * Sign out the current user
     */
    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    /**
     * Send password reset email
     */
    async resetPassword(request: ResetPasswordRequest) {
        const { error } = await supabase.auth.resetPasswordForEmail(
            request.email,
            {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            }
        );

        if (error) throw error;
    },

    /**
     * Update user password (after reset)
     */
    async updatePassword(request: UpdatePasswordRequest) {
        const { error } = await supabase.auth.updateUser({
            password: request.password,
        });

        if (error) throw error;
    },

    /**
     * Update user profile metadata
     */
    async updateProfile(data: { full_name?: string; avatar_url?: string }) {
        const { error } = await supabase.auth.updateUser({
            data,
        });

        if (error) throw error;
    },

    /**
     * Resend email confirmation
     */
    async resendConfirmation(email: string) {
        const { error } = await supabase.auth.resend({
            type: "signup",
            email,
        });

        if (error) throw error;
    },
};
