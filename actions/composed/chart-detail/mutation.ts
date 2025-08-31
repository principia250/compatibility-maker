'use server';

import { createClient } from "@/lib/supabase/server";
import { Response } from "@/actions/types/response";

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

export const addComment = async (props: AddCommentParams): Promise<Response<AddCommentResult>> => {
    const supabase = await createClient();

    try {
        // コメントを挿入
        const { data: commentData, error: insertError } = await supabase
            .from('comments')
            .insert({
                content: props.content,
                user_id: props.userId,
                chart_id: props.chartId
            })
            .select(`
                id,
                content,
                user_id,
                chart_id,
                created_at
            `)
            .single();

        if (insertError) {
            console.error('Comment insert error:', insertError);
            return {
                data: null,
                error: {
                    message: 'コメントの投稿に失敗しました'
                }
            };
        }

        return {
            data: {
                id: commentData.id,
                content: commentData.content,
                userId: commentData.user_id,
                chartId: commentData.chart_id,
                createdAt: commentData.created_at || new Date().toISOString()
            },
            error: null
        };
    } catch (error) {
        console.error('Unexpected error:', error);
        return {
            data: null,
            error: {
                message: '予期しないエラーが発生しました'
            }
        };
    }
};

export const toggleBookmark = async (props: ToggleBookmarkParams): Promise<Response<ToggleBookmarkResult>> => {
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
                    message: 'ブックマークの確認に失敗しました'
                }
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
                        message: 'ブックマークの削除に失敗しました'
                    }
                };
            }

            return {
                data: { isBookmarked: false },
                error: null
            };
        } else {
            // 新しいブックマークを追加
            const { error: insertError } = await supabase
                .from('bookmarks')
                .insert({
                    chart_id: props.chartId,
                    user_id: props.userId
                });

            if (insertError) {
                console.error('Bookmark insert error:', insertError);
                return {
                    data: null,
                    error: {
                        message: 'ブックマークの追加に失敗しました'
                    }
                };
            }

            return {
                data: { isBookmarked: true },
                error: null
            };
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        return {
            data: null,
            error: {
                message: '予期しないエラーが発生しました'
            }
        };
    }
};

export const toggleGood = async (props: ToggleGoodParams): Promise<Response<ToggleGoodResult>> => {
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
                    message: 'グッドの確認に失敗しました'
                }
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
                        message: 'グッドの削除に失敗しました'
                    }
                };
            }

            return {
                data: { isGood: false },
                error: null
            };
        } else {
            // 新しいグッドを追加
            const { error: insertError } = await supabase
                .from('goods')
                .insert({
                    chart_id: props.chartId,
                    user_id: props.userId
                });

            if (insertError) {
                console.error('Good insert error:', insertError);
                return {
                    data: null,
                    error: {
                        message: 'グッドの追加に失敗しました'
                    }
                };
            }

            return {
                data: { isGood: true },
                error: null
            };
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        return {
            data: null,
            error: {
                message: '予期しないエラーが発生しました'
            }
        };
    }
};
