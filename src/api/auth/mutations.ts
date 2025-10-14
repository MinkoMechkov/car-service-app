import { supabase } from "@/utils/supabaseClient";

import type {
    LoginCredentials,
    RegisterCredentials,
    ResetPasswordRequest,
    AuthResponse,
} from "./interfaces";

export const registerUser = async (
    credentials: RegisterCredentials
): Promise<AuthResponse> => {
    const { email, password, fullName } = credentials;
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, message: "Registration successful" };
};

export const loginUser = async (
    credentials: LoginCredentials
): Promise<AuthResponse> => {
    const { email, password } = credentials;
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, message: "Login successful" };
};

export const resetPassword = async (
    request: ResetPasswordRequest
): Promise<AuthResponse> => {
    const { email } = request;
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, message: "Password reset email sent" };
};

export const authMutations = {
    registerUser,
    loginUser,
    resetPassword,
};
