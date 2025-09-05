'use server';

import { createClient } from "@/lib/supabase/server";
import { Response } from "@/actions/types/response";
import { ChartEditData, fetchChartEditData } from "./fetch";

export const saveChartData = async (chartData: ChartEditData): Promise<Response<ChartEditData>> => {
    try {
        const supabase = await createClient();
        
        // 1. チャート基本情報の更新
        const { error: chartError } = await supabase
            .from('compatibility_charts')
            .update({
                title: chartData.title,
                is_public: chartData.isPublic,
                updated_at: new Date().toISOString()
            })
            .eq('id', chartData.id);

        if (chartError) {
            return { data: null, error: chartError };
        }

        // 2. カテゴリ名の更新
        const { error: leftCategoryError } = await supabase
            .from('element_categories')
            .update({ name: chartData.leftCategory.name })
            .eq('id', chartData.leftCategory.id);

        if (leftCategoryError) {
            return { data: null, error: leftCategoryError };
        }

        const { error: rightCategoryError } = await supabase
            .from('element_categories')
            .update({ name: chartData.rightCategory.name })
            .eq('id', chartData.rightCategory.id);

        if (rightCategoryError) {
            return { data: null, error: rightCategoryError };
        }

        // 3. 既存の要素を取得（削除対象の特定のため）
        const { data: existingLeftElements, error: leftElementsError } = await supabase
            .from('elements')
            .select('id')
            .eq('element_category_id', chartData.leftCategory.id);

        if (leftElementsError) {
            return { data: null, error: leftElementsError };
        }

        const { data: existingRightElements, error: rightElementsError } = await supabase
            .from('elements')
            .select('id')
            .eq('element_category_id', chartData.rightCategory.id);

        if (rightElementsError) {
            return { data: null, error: rightElementsError };
        }

        // 4. 左側要素の処理
        const currentLeftElementIds = chartData.leftCategory.elements
            .filter(el => !el.id.startsWith('temp-'))
            .map(el => el.id);
        const deletedLeftElementIds = existingLeftElements
            ?.filter(el => !currentLeftElementIds.includes(el.id))
            .map(el => el.id) || [];

        // 削除された左側要素を削除（ON DELETE CASCADEで関連compatibilityも削除される）
        if (deletedLeftElementIds.length > 0) {
            const { error: deleteLeftError } = await supabase
                .from('elements')
                .delete()
                .in('id', deletedLeftElementIds);

            if (deleteLeftError) {
                return { data: null, error: deleteLeftError };
            }
        }

        // 右側要素の処理
        const currentRightElementIds = chartData.rightCategory.elements
            .filter(el => !el.id.startsWith('temp-'))
            .map(el => el.id);
        const deletedRightElementIds = existingRightElements
            ?.filter(el => !currentRightElementIds.includes(el.id))
            .map(el => el.id) || [];

        // 削除された右側要素を削除
        if (deletedRightElementIds.length > 0) {
            const { error: deleteRightError } = await supabase
                .from('elements')
                .delete()
                .in('id', deletedRightElementIds);

            if (deleteRightError) {
                return { data: null, error: deleteRightError };
            }
        }

        // 5. 要素の新規挿入・更新（一時IDから実際のIDへのマッピングを作成）
        const tempIdToRealIdMap = new Map<string, string>();

        for (const element of chartData.leftCategory.elements) {
            if (element.id.startsWith('temp-')) {
                // 新規挿入
                const { data: insertedElement, error: insertError } = await supabase
                    .from('elements')
                    .insert({
                        element_category_id: chartData.leftCategory.id,
                        name: element.name
                    })
                    .select('id')
                    .single();

                if (insertError) {
                    return { data: null, error: insertError };
                }

                if (insertedElement) {
                    tempIdToRealIdMap.set(element.id, insertedElement.id);
                }
            } else {
                // 既存更新
                const { error: updateError } = await supabase
                    .from('elements')
                    .update({ name: element.name })
                    .eq('id', element.id);

                if (updateError) {
                    console.error('Update left element error:', updateError);
                    return { data: null, error: updateError };
                }
            }
        }

        for (const element of chartData.rightCategory.elements) {
            if (element.id.startsWith('temp-')) {
                // 新規挿入
                const { data: insertedElement, error: insertError } = await supabase
                    .from('elements')
                    .insert({
                        element_category_id: chartData.rightCategory.id,
                        name: element.name
                    })
                    .select('id')
                    .single();

                if (insertError) {
                    return { data: null, error: insertError };
                }

                if (insertedElement) {
                    tempIdToRealIdMap.set(element.id, insertedElement.id);
                }
            } else {
                // 既存更新
                const { error: updateError } = await supabase
                    .from('elements')
                    .update({ name: element.name })
                    .eq('id', element.id);

                if (updateError) {
                    return { data: null, error: updateError };
                }
            }
        }

        // 6. 相性データの完全再構築
        // 既存の相性データを削除
        const { error: deleteCompatError } = await supabase
            .from('compatibilities')
            .delete()
            .eq('chart_id', chartData.id);

        if (deleteCompatError) {
            return { data: null, error: deleteCompatError };
        }

        // 新しい相性データを挿入
        if (chartData.compatibilities.length > 0) {
            // 一時IDを実際のIDに置き換えた相性データを作成
            const processedCompatibilities = chartData.compatibilities.map(comp => ({
                ...comp,
                leftElementId: tempIdToRealIdMap.get(comp.leftElementId) || comp.leftElementId,
                rightElementId: tempIdToRealIdMap.get(comp.rightElementId) || comp.rightElementId
            }));

            // 有効なIDのみの相性データを処理
            const validCompatibilities = processedCompatibilities.filter(comp => 
                !comp.leftElementId.startsWith('temp-') && 
                !comp.rightElementId.startsWith('temp-')
            );

            if (validCompatibilities.length > 0) {
                // compatibility_scoresテーブルからスコアIDを取得
                const { data: compatibilityScores, error: scoresError } = await supabase
                    .from('compatibility_scores')
                    .select('id, score');

                if (scoresError) {
                    console.error('Fetch compatibility scores error:', scoresError);
                    return { data: null, error: scoresError };
                }

                // スコア値からIDへのマッピングを作成
                const scoreToIdMap = new Map<number, string>();
                compatibilityScores?.forEach(score => {
                    scoreToIdMap.set(score.score, score.id);
                });

                const compatibilitiesToInsert = validCompatibilities
                    .filter(comp => comp.compatibilityScore !== null && comp.reverseCompatibilityScore !== null)
                    .map(comp => ({
                        chart_id: chartData.id,
                        left_element_id: comp.leftElementId,
                        right_element_id: comp.rightElementId,
                        compatibility_score_id: scoreToIdMap.get(comp.compatibilityScore!)!,
                        reverse_compatibility_score_id: scoreToIdMap.get(comp.reverseCompatibilityScore!)!,
                        note: comp.note || null
                    }))
                    .filter(comp => comp.compatibility_score_id && comp.reverse_compatibility_score_id); // 有効なIDのみ

                if (compatibilitiesToInsert.length > 0) {
                    const { error: insertCompatError } = await supabase
                        .from('compatibilities')
                        .insert(compatibilitiesToInsert);

                    if (insertCompatError) {
                        console.error('Insert compatibilities error:', insertCompatError);
                        return { data: null, error: insertCompatError };
                    }
                }
            } else {
                console.log('No valid compatibilities to insert');
            }
        } else {
            console.log('No compatibilities in chartData');
        }

        // 7. 保存完了後、最新データを再取得してフロントエンドに返却
        const { data: updatedChartData, error: fetchError } = await fetchChartEditData({ chartId: chartData.id });
        
        if (fetchError) {
            return { data: null, error: fetchError };
        }

        return { data: updatedChartData, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
};
