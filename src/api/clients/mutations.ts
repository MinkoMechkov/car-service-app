import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { supabase } from "@/utils/supabaseClient";
import type { Client } from "./interfaces";
import { useGlobalState } from "@/composables/useGlobalState";

export const useCreateClientMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useGlobalState();
    return useMutation({
        mutationFn: async (newClient: Omit<Client, "id" | "created_at">) => {
            const { data, error } = await supabase
                .from("clients")
                .insert({ ...newClient, user_id: user.value?.id })
                .select("id");
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            queryClient.invalidateQueries({ queryKey: ["clientsList"] });
        },
    });
};

export const useUpdateClientMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useGlobalState();
    return useMutation({
        mutationFn: async (updatedClient: Partial<Client> & { id: string }) => {
            const { data, error } = await supabase
                .from("clients")
                .update({ ...updatedClient, user_id: user.value?.id })
                .eq("id", updatedClient.id)
                .select("id");
            if (error) throw error;
            // If no rows were updated, surface an explicit error so the UI can react
            if (!data || (Array.isArray(data) && data.length === 0)) {
                throw new Error(
                    "No rows updated. Check record ID or permissions."
                );
            }
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            queryClient.invalidateQueries({ queryKey: ["clientsList"] });
            if (variables?.id) {
                queryClient.invalidateQueries({
                    queryKey: ["clients", variables.id],
                });
            }
        },
    });
};

export const useDeleteClientMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("clients")
                .delete()
                .eq("id", id);
            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            queryClient.invalidateQueries({ queryKey: ["clientsList"] });
        },
    });
};
