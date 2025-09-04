"use server";

import { createClient } from "@/lib/supabase/server";
import { Response } from "@/actions/types/response";

interface DuplicateChartParams {
    chartId: string;
}

export async function duplicateChart({ chartId }: DuplicateChartParams): Promise<Response<{ newChartId: string }>> {
    try {
        const supabase = await createClient();
        
        // 認証チェック
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { data: null, error: { message: "Need authentication" } };
        }

        // PostgreSQL関数を呼び出してチャートを複製
        const { data, error } = await (supabase as any).rpc('duplicate_chart', {
            p_chart_id: chartId,
            p_user_id: user.id
        });

        if (error) {
            console.error('duplicate_chart RPC error:', error);
            return { data: null, error: { message: "Chart duplication failed" } };
        }

        if (!data || data.length === 0) {
            return { data: null, error: { message: "Chart duplication failed" } };
        }

        const result = data[0];
        
        if (!result.success) {
            return { data: null, error: { message: result.error_message || "Chart duplication failed" } };
        }

        return { data: { newChartId: result.new_chart_id }, error: null };
    } catch (error) {
        console.error('duplicateChart error:', error);
        return { data: null, error: { message: "Unexpected error occurred" } };
    }
}

interface DeleteChartParams {
    chartId: string;
}

export async function deleteChart({ chartId }: DeleteChartParams): Promise<Response<void>> {
    try {
        const supabase = await createClient();
        
        // 認証チェック
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { data: null, error: { message: "Need authentication" } };
        }

        // ユーザーのpublic IDを取得
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('auth_user_id', user.id)
            .single();

        if (userError || !userData) {
            return { data: null, error: { message: "User not found" } };
        }

        // チャートの所有者かチェック
        const { data: chartData, error: chartError } = await supabase
            .from('compatibility_charts')
            .select('id, title')
            .eq('id', chartId)
            .eq('user_id', userData.id)
            .single();

        if (chartError || !chartData) {
            return { data: null, error: { message: "Chart not found or access denied" } };
        }

        // チャートを削除（CASCADEで関連データも削除される）
        const { error: deleteError } = await supabase
            .from('compatibility_charts')
            .delete()
            .eq('id', chartId);

        if (deleteError) {
            return { data: null, error: { message: "Failed to delete chart" } };
        }

        return { data: null, error: null };
    } catch (error) {
        console.error('deleteChart error:', error);
        return { data: null, error: { message: "Unexpected error occurred" } };
    }
}
