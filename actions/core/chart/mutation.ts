"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CreateChartParams {
  title: string;
  isPublic: boolean;
  userId: string;
}

export interface CreateChartResult {
  data: {
    id: string;
    title: string;
    is_public: boolean;
    user_id: string;
  } | null;
  error: string | null;
}

export async function createChart({ title, isPublic, userId }: CreateChartParams): Promise<CreateChartResult> {
  try {
    const supabase = await createClient();

    // RPCを使用してチャートとカテゴリを一括作成
    const { data, error } = await (supabase as any).rpc('create_chart_with_categories', {
      p_title: title.trim(),
      p_is_public: isPublic,
      p_user_id: userId
    });

    if (error) {
      console.error('Chart creation error:', error);
      return { data: null, error: "チャートの作成に失敗しました" };
    }

    // キャッシュを無効化
    revalidatePath('/mypage');
    
    return { data: data, error: null };
  } catch (error) {
    console.error('Unexpected error in createChart:', error);
    return { data: null, error: "予期しないエラーが発生しました" };
  }
}
