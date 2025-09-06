'use server';

import { createClient } from '@/lib/supabase/server';
import { Response } from '@/actions/types/response';

export interface CompatibilityScoreData {
  compatibilityScores: {
    id: string;
    score: number;
    notation: string;
  }[];
}

export const fetchCompatibilityScoreData = async (): Promise<
  Response<CompatibilityScoreData>
> => {
  const supabase = await createClient();

  try {
    // fetch処理を並列実行
    const [result] = await Promise.all([
      supabase.from('compatibility_scores').select('id, score, notation'),
    ]);

    const { data: data, error: error } = result;

    if (error) {
      console.error('Compatibility scores fetch error:', error);
      return {
        data: null,
        error: {
          message: 'Failed to fetch compatibility scores',
        },
      };
    }

    return {
      data: {
        compatibilityScores: data
          ? data.map((item) => ({
              id: item.id,
              score: item.score,
              notation: item.notation,
            }))
          : [],
      },
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error in fetchCompatibilityScoreData:', error);
    return {
      data: null,
      error: {
        message: 'Unexpected error occurred',
      },
    };
  }
};
