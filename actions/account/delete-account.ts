"use server";

import { createClient } from "@/lib/supabase/server";
import { Response } from "@/actions/types/response";

export async function deleteAccount(): Promise<Response<void>> {
    try {
        const supabase = await createClient();
        
        // 認証チェック
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { data: null, error: { message: "Need authentication" } };
        }

        // PostgreSQL関数を使用してトランザクション内でデータを削除
        const { error: deleteError } = await (supabase as any).rpc('delete_user_account', {
            auth_user_id: user.id
        });

        if (deleteError) {
            console.error('Error deleting user data:', deleteError);
            return { data: null, error: { message: "Failed to delete user data" } };
        }

        // Supabase Authからユーザーを削除
        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);

        if (authDeleteError) {
            console.error('Error deleting auth user:', authDeleteError);
            return { data: null, error: { message: "Failed to delete auth user" } };
        }

        return { data: undefined, error: null };
    } catch (error) {
        console.error('deleteAccount error:', error);
        return { data: null, error: { message: "Unexpected error occurred" } };
    }
}
