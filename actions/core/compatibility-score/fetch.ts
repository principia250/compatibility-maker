'use server'

import { createClient } from "@/lib/supabase/server";
import { Response } from "@/actions/types/response";

export interface CompatibilityScoreData {
    compatibilityScores: {
        id: string;
        score: number;
        notation: string;
    }[];
}

export const fetchCompatibilityScoreData = async (): Promise<Response<CompatibilityScoreData>> => {
    const supabase = await createClient();

    try {
        // fetch処理を並列実行
        const [result] = await Promise.all([
            supabase.from('compatibility_scores')
                .select('id, score, notation'),
        ]);

        const { data: data, error: error } = result;
        
        if (error) {
            return {
                data: null,
                error: {
                    message: 'データの取得に失敗しました'
                }
            };
        }

        return {
            data: {
                compatibilityScores: data ? data.map((item) => ({
                    id: item.id,
                    score: item.score,
                    notation: item.notation
                })) : []
            },
            error: null
        }
    } catch (error) {
        return {
            data: null,
            error: {
                message: '予期しないエラーが発生しました'
            }
        };
    }
}