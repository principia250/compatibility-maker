'use server'

import { createClient } from "@/lib/supabase/server";
import { Response } from "@/actions/types/response";
import { MAX_CHARTS } from "@/constants/max-charts";

export interface MypageData {
    maxCharts: number;
    bookmarks: {
        id: string;
        compatibilityChart: {
            id: string;
            title: string;
            user: {
                id: string;
                username: string;
            }
        }
    }[];
    charts: {
        id: string;
        title: string;
    }[];
}

export interface MypageDataParams {
    userId: string;
}

export const fetchMypageData = async (props: MypageDataParams): Promise<Response<MypageData>> => {
    const supabase = await createClient();

    try {
        // fetch処理を並列実行
        const [bookmarksResult, chartsResult, userResult] = await Promise.all([
            supabase
                .from('bookmarks')
                .select(`
                    id, 
                    compatibility_charts:chart_id(
                        id, 
                        title,
                        users:user_id(
                            id,
                            username
                        )
                    )
                `)
                .eq('user_id', props.userId)
                .eq('compatibility_charts.is_public', true),
            
            supabase
                .from('compatibility_charts')
                .select('id, title')
                .eq('user_id', props.userId),
            
            supabase
                .from('users')
                .select(`
                    plan_expires_at,
                    plans:plan_id(
                        max_charts
                    )
                `)
                .eq('id', props.userId)
                .single()
        ]);

        const { data: bookmarksData, error: bookmarksError } = bookmarksResult;
        const { data: charts, error: chartsError } = chartsResult;
        const { data: userData, error: userError } = userResult;
        
        if (bookmarksError || chartsError || userError) {
            console.error('Mypage data fetch error:', { bookmarksError, chartsError, userError });
            return {
                data: null,
                error: {
                    message: 'Failed to fetch mypage data'
                }
            };
        }

        // 最大チャート数を取得
        const maxCharts = (userData?.plan_expires_at === undefined || userData?.plan_expires_at === null || userData?.plan_expires_at < new Date().toISOString()) ? MAX_CHARTS : userData?.plans.max_charts
        
        return {
            data: {
                maxCharts: maxCharts,
                bookmarks: bookmarksData ? bookmarksData
                    .filter(bookmark => bookmark.compatibility_charts !== null) // nullチェック
                    .map((bookmark) =>({
                        id: bookmark.id,
                        compatibilityChart: {
                            id: bookmark.compatibility_charts!.id,
                            title: bookmark.compatibility_charts!.title,
                            user: {
                                id: bookmark.compatibility_charts!.users.id,
                                username: bookmark.compatibility_charts!.users.username
                            }
                        }
                    })) : [],
                charts: charts ? charts.map((chart) => ({
                    id: chart.id,
                    title: chart.title
                })) : []
            },
            error: null
        }
    } catch (error) {
        console.error('Unexpected error in fetchMypageData:', error);
        return {
            data: null,
            error: {
                message: 'Unexpected error occurred'
            }
        };
    }
}