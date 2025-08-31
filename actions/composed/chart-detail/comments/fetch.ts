'use server';

import { createClient } from "@/lib/supabase/server";
import { Response } from "@/actions/types/response";

export interface ChartCommentsData {
    chart: {
        id: string;
        title: string;
        user: {
            id: string;
            username: string;
        };
    };
    comments: {
        id: string;
        content: string;
        createdAt: string;
        user: {
            id: string;
            username: string;
        };
    }[];
}

export const fetchChartComments = async (props: { chartId: string }): Promise<Response<ChartCommentsData>> => {
    const supabase = await createClient();

    try {
        // チャート情報とコメントを取得
        const { data: chartData, error: chartError } = await supabase
            .from('compatibility_charts')
            .select(`
                id,
                title,
                users:user_id (
                    id,
                    username
                )
            `)
            .eq('id', props.chartId)
            .single();

        if (chartError) {
            console.error('Chart fetch error:', chartError);
            return {
                data: null,
                error: {
                    message: 'チャート情報の取得に失敗しました'
                }
            };
        }

        // コメントを取得（作成日降順）
        const { data: commentsData, error: commentsError } = await supabase
            .from('comments')
            .select(`
                id,
                content,
                created_at,
                users:user_id (
                    id,
                    username
                )
            `)
            .eq('chart_id', props.chartId)
            .order('created_at', { ascending: false });

        if (commentsError) {
            console.error('Comments fetch error:', commentsError);
            return {
                data: null,
                error: {
                    message: 'コメントの取得に失敗しました'
                }
            };
        }

        return {
            data: {
                chart: {
                    id: chartData.id,
                    title: chartData.title,
                    user: {
                        id: chartData.users.id,
                        username: chartData.users.username
                    }
                },
                comments: commentsData.map(comment => ({
                    id: comment.id,
                    content: comment.content,
                    createdAt: comment.created_at || new Date().toISOString(),
                    user: {
                        id: comment.users.id,
                        username: comment.users.username
                    }
                }))
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
