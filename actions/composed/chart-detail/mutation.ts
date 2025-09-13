'use server';

import { createClient } from '@/lib/supabase/server';
import { Response } from '@/actions/types/response';
import { revalidatePath } from 'next/cache';
import { MAX_CHARTS } from '@/constants/max-charts';
import { COMMENT_MAX_LENGTH } from '@/constants/input-length';

export interface AddCommentParams {
  chartId: string;
  userId: string;
  content: string;
}

export interface AddCommentResult {
  id: string;
  content: string;
  userId: string;
  chartId: string;
  createdAt: string;
}

export interface ToggleBookmarkParams {
  chartId: string;
  userId: string;
}

export interface ToggleBookmarkResult {
  isBookmarked: boolean;
}

export interface ToggleGoodParams {
  chartId: string;
  userId: string;
}

export interface ToggleGoodResult {
  isGood: boolean;
}

export interface CopyChartParams {
  sourceChartId: string;
  targetUserId: string;
}

export interface CopyChartResult {
  chartId: string;
}

export const addComment = async (
  props: AddCommentParams
): Promise<Response<AddCommentResult>> => {
  const supabase = await createClient();

  try {
    // バリデーション
    if (!props.content || props.content.trim().length === 0) {
      return {
        data: null,
        error: {
          message: 'Enter a comment',
        },
      };
    }

    if (props.content.length > COMMENT_MAX_LENGTH) {
      return {
        data: null,
        error: {
          message: `Enter a comment of ${COMMENT_MAX_LENGTH} characters or less`,
        },
      };
    }

    // コメントを挿入
    const { data: commentData, error: insertError } = await supabase
      .from('comments')
      .insert({
        content: props.content.trim(),
        user_id: props.userId,
        chart_id: props.chartId,
      })
      .select(
        `
                id,
                content,
                user_id,
                chart_id,
                created_at
            `
      )
      .single();

    if (insertError) {
      console.error('Comment insert error:', insertError);
      return {
        data: null,
        error: {
          message: 'Failed to post comment',
        },
      };
    }

    return {
      data: {
        id: commentData.id,
        content: commentData.content,
        userId: commentData.user_id,
        chartId: commentData.chart_id,
        createdAt: commentData.created_at || new Date().toISOString(),
      },
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error in addComment:', error);
    return {
      data: null,
      error: {
        message: 'Unexpected error occurred',
      },
    };
  }
};

export const toggleBookmark = async (
  props: ToggleBookmarkParams
): Promise<Response<ToggleBookmarkResult>> => {
  const supabase = await createClient();

  try {
    // 既存のブックマークを確認
    const { data: existingBookmark, error: selectError } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('chart_id', props.chartId)
      .eq('user_id', props.userId)
      .maybeSingle();

    if (selectError) {
      console.error('Bookmark select error:', selectError);
      return {
        data: null,
        error: {
          message: 'Failed to check bookmark status',
        },
      };
    }

    if (existingBookmark) {
      // 既存のブックマークを削除
      const { error: deleteError } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existingBookmark.id);

      if (deleteError) {
        console.error('Bookmark delete error:', deleteError);
        return {
          data: null,
          error: {
            message: 'Failed to remove bookmark',
          },
        };
      }

      return {
        data: { isBookmarked: false },
        error: null,
      };
    } else {
      // 新しいブックマークを追加
      const { error: insertError } = await supabase.from('bookmarks').insert({
        chart_id: props.chartId,
        user_id: props.userId,
      });

      if (insertError) {
        console.error('Bookmark insert error:', insertError);
        return {
          data: null,
          error: {
            message: 'Failed to add bookmark',
          },
        };
      }

      return {
        data: { isBookmarked: true },
        error: null,
      };
    }
  } catch (error) {
    console.error('Unexpected error in toggleBookmark:', error);
    return {
      data: null,
      error: {
        message: 'Unexpected error occurred',
      },
    };
  }
};

export const toggleGood = async (
  props: ToggleGoodParams
): Promise<Response<ToggleGoodResult>> => {
  const supabase = await createClient();

  try {
    // 既存のグッドを確認
    const { data: existingGood, error: selectError } = await supabase
      .from('goods')
      .select('id')
      .eq('chart_id', props.chartId)
      .eq('user_id', props.userId)
      .maybeSingle();

    if (selectError) {
      console.error('Good select error:', selectError);
      return {
        data: null,
        error: {
          message: 'Failed to check good status',
        },
      };
    }

    if (existingGood) {
      // 既存のグッドを削除
      const { error: deleteError } = await supabase
        .from('goods')
        .delete()
        .eq('id', existingGood.id);

      if (deleteError) {
        console.error('Good delete error:', deleteError);
        return {
          data: null,
          error: {
            message: 'Failed to remove good',
          },
        };
      }

      return {
        data: { isGood: false },
        error: null,
      };
    } else {
      // 新しいグッドを追加
      const { error: insertError } = await supabase.from('goods').insert({
        chart_id: props.chartId,
        user_id: props.userId,
      });

      if (insertError) {
        console.error('Good insert error:', insertError);
        return {
          data: null,
          error: {
            message: 'Failed to add good',
          },
        };
      }

      return {
        data: { isGood: true },
        error: null,
      };
    }
  } catch (error) {
    console.error('Unexpected error in toggleGood:', error);
    return {
      data: null,
      error: {
        message: 'Unexpected error occurred',
      },
    };
  }
};

export const copyChart = async (
  props: CopyChartParams
): Promise<Response<CopyChartResult>> => {
  try {
    const supabase = await createClient();

    // 1. ユーザーの最大チャート数を取得
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(
        `
        plan_expires_at,
        plans:plan_id(
          max_charts
        )
      `
      )
      .eq('id', props.targetUserId)
      .single();

    if (userError) {
      console.error('User data fetch error:', userError);
      return {
        data: null,
        error: {
          message: 'Failed to fetch user data',
        },
      };
    }

    // 2. 最大チャート数を計算
    const maxCharts =
      userData?.plan_expires_at === undefined ||
      userData?.plan_expires_at === null ||
      userData?.plan_expires_at < new Date().toISOString()
        ? MAX_CHARTS
        : userData?.plans.max_charts;

    // 3. 現在のチャート数を取得
    const { data: chartsData, error: chartsError } = await supabase
      .from('compatibility_charts')
      .select('id')
      .eq('user_id', props.targetUserId);

    if (chartsError) {
      console.error('Charts count fetch error:', chartsError);
      return {
        data: null,
        error: {
          message: 'Failed to fetch charts count',
        },
      };
    }

    // 4. 最大チャート数に達しているかチェック
    if (chartsData && chartsData.length >= maxCharts) {
      return {
        data: null,
        error: {
          message: 'Maximum chart limit reached',
        },
      };
    }

    // 5. Call the PostgreSQL function to copy the chart
    const { data, error } = await supabase.rpc('copy_chart', {
      source_chart_id: props.sourceChartId,
      target_user_id: props.targetUserId,
    });

    if (error) {
      console.error('Error copying chart:', error);
      return {
        data: null,
        error: {
          message: error.message,
        },
      };
    }

    if (!data) {
      return {
        data: null,
        error: {
          message: 'Failed to copy chart',
        },
      };
    }

    // Revalidate relevant pages
    revalidatePath('/mypage');
    revalidatePath('/search');

    return {
      data: {
        chartId: data,
      },
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error copying chart:', error);
    return {
      data: null,
      error: {
        message: 'Unexpected error occurred while copying chart',
      },
    };
  }
};
