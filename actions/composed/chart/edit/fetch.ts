'use server';

import { createClient } from "@/lib/supabase/server";
import { Response } from "@/actions/types/response";

export interface ChartEditData {
    id: string;
    title: string;
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
}

export const fetchChartEditData = async (props: { chartId: string }): Promise<Response<ChartEditData>> => {
    const supabase = await createClient();

    try {
        const { data: chartData, error: chartError } = await supabase
            .from('compatibility_charts')
            .select(`
                id,
                title,
                is_public,
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
                )
            `)
            .eq('id', props.chartId)
            .eq('left_categories.side', 'left')
            .eq('right_categories.side', 'right')
            .single();
        
        if (chartError) {
            return {
                data: null,
                error: {
                    message: 'データの取得に失敗しました'
                }
            };
        }

        return {
            data: {
                id: chartData.id,
                title: chartData.title,
                isPublic: chartData.is_public,
                leftCategory: {
                    id: chartData.left_categories[0]?.id || '',
                    name: chartData.left_categories[0]?.name || '',
                    elements: chartData.left_categories[0]?.elements.map((element: any) => ({
                        id: element.id,
                        name: element.name
                    })) || []
                },
                rightCategory: {
                    id: chartData.right_categories[0]?.id || '',
                    name: chartData.right_categories[0]?.name || '',
                    elements: chartData.right_categories[0]?.elements.map((element: any) => ({
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