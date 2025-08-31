'use server';

import { createClient } from "@/lib/supabase/server";
import { Response } from "@/actions/types/response";

export interface ChartDetailData {
    id: string;
    title: string;
    user: {
        id: string;
        username: string;
    }
    isPublic: boolean;
    leftCategory: {
        id: string;
        name: string;
        elements: {
            id: string;
            name: string;
        }[]
    }
    rightCategory: {
        id: string;
        name: string;
        elements: {
            id: string;
            name: string;
        }[]
    }
    compatibilities: {
        id: string;
        leftElementId: string;
        rightElementId: string;
        compatibilityScore: number;
        reverseCompatibilityScore: number;
    }[]
    comments: {
        id: string;
        content: string;
        createdAt: string;
        user: {
            id: string;
            username: string;
        }
    }[]
    bookmark: string | null;
    good: string | null;
}

export const fetchChartDetailData = async (props: { chartId: string, loginUserId: string }): Promise<Response<ChartDetailData>> => {
    const supabase = await createClient();

    try {
        // チャート基本情報、カテゴリ、相性情報、コメントを一つのクエリで取得
        const { data: chartData, error: chartError } = await supabase
            .from('compatibility_charts')
            .select(`
                id,
                title,
                is_public,
                users!compatibility_charts_user_id_fkey (
                    id,
                    username
                ),
                left_categories:element_categories!element_categories_chart_id_fkey (
                    id,
                    name,
                    elements!elements_element_category_id_fkey (
                        id,
                        name
                    )
                ),
                right_categories:element_categories!element_categories_chart_id_fkey (
                    id,
                    name,
                    elements!elements_element_category_id_fkey (
                        id,
                        name
                    )
                ),
                compatibilities!compatibilities_chart_id_fkey (
                    id,
                    left_element_id,
                    right_element_id,
                    compatibility_scores!compatibilities_compatibility_score_id_fkey (
                        score
                    ),
                    reverse_compatibility_scores:compatibility_scores!compatibilities_reverse_compatibility_score_id_fkey (
                        score
                    )
                ),
                comments!comments_chart_id_fkey (
                    id,
                    content,
                    created_at,
                    users!comments_user_id_fkey (
                        id,
                        username
                    )
                )
            `)
            .eq('id', props.chartId)
            .eq('left_categories.side', 'left')
            .eq('right_categories.side', 'right')
            .order('created_at', { referencedTable: 'comments', ascending: false })
            .limit(10, { foreignTable: 'comments' })
            .single();

        // ブックマークとgoodの有無を並列で取得
        const [bookmarkResult, goodResult] = await Promise.all([
            supabase
                .from('bookmarks')
                .select('id')
                .eq('chart_id', props.chartId)
                .eq('user_id', props.loginUserId)
                .maybeSingle(),
            
            supabase
                .from('goods')
                .select('id')
                .eq('chart_id', props.chartId)
                .eq('user_id', props.loginUserId)
                .maybeSingle()
        ]);

        const { data: bookmarkData, error: bookmarkError } = bookmarkResult;
        const { data: goodData, error: goodError } = goodResult;
        
        if (chartError || bookmarkError || goodError) {
            return {
                data: null,
                error: {
                    message: 'データの取得に失敗しました'
                }
            };
        }

        // スコアを計算する関数
        const calculateScore = (elementId: string, side: 'left' | 'right') => {
            const compatibilities = chartData.compatibilities;
            if (side === 'left') {
                // compatibilitiesからleftElementIdがelementIdのものを取得
                const leftCompatibility = compatibilities?.filter((compatibility) => {
                    return compatibility.left_element_id === elementId;
                });
                // 抽出したcompatibilitiesのcompatibilityScoreを合計
                const sum = leftCompatibility?.reduce((acc, compatibility) => acc + compatibility.compatibility_scores.score, 0)
                // 合計をlengthで割る
                return (sum === undefined || leftCompatibility === undefined || leftCompatibility?.length === 0) ? 0 : sum / (leftCompatibility?.length || 0)
            } else {
                // 右側の場合はreverseCompatibilityScoreを使用
                const rightCompatibility = compatibilities?.filter((compatibility) => {
                    return compatibility.right_element_id === elementId;
                });
                const sum = rightCompatibility?.reduce((acc, compatibility) => acc + compatibility.reverse_compatibility_scores.score, 0)
                return (sum === undefined || rightCompatibility === undefined || rightCompatibility?.length === 0) ? 0 : sum / (rightCompatibility?.length || 0)
            }
        }

        // 一時的にleftCategoryとrightCategoryのelementsを代入
        let leftElements = chartData.left_categories[0]?.elements.map((element: any) => ({
            id: element.id,
            name: element.name,
            score: calculateScore(element.id, 'left')
        }));
        let rightElements = chartData.right_categories[0]?.elements.map((element: any) => ({
            id: element.id,
            name: element.name,
            score: calculateScore(element.id, 'right')
        }));

        // ソート
        // 第一ソート: スコアが高い順
        // 第二ソート: 50音順
        leftElements = leftElements?.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
        rightElements = rightElements?.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

        return {
            data: {
                id: chartData.id,
                title: chartData.title,
                user: {
                    id: chartData.users.id,
                    username: chartData.users.username
                },
                isPublic: chartData.is_public,
                leftCategory: {
                    id: chartData.left_categories[0]?.id || '',
                    name: chartData.left_categories[0]?.name || '',
                    elements: leftElements?.map((element: any) => ({
                        id: element.id,
                        name: element.name
                    })) || []
                },
                rightCategory: {
                    id: chartData.right_categories[0]?.id || '',
                    name: chartData.right_categories[0]?.name || '',
                    elements: rightElements?.map((element: any) => ({
                        id: element.id,
                        name: element.name
                    })) || []
                },
                compatibilities: chartData.compatibilities?.map((compatibility: any) => ({
                    id: compatibility.id,
                    leftElementId: compatibility.left_element_id,
                    rightElementId: compatibility.right_element_id,
                    compatibilityScore: compatibility.compatibility_scores?.score || 0,
                    reverseCompatibilityScore: compatibility.reverse_compatibility_scores?.score || 0
                })) || [],
                comments: chartData.comments?.map((comment: any) => ({
                    id: comment.id,
                    content: comment.content,
                    createdAt: comment.created_at,
                    user: {
                        id: comment.users.id,
                        username: comment.users.username
                    }
                })) || [],
                bookmark: bookmarkData?.id || null,
                good: goodData?.id || null
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