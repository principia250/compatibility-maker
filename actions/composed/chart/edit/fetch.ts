'use server';

import { createClient } from '@/lib/supabase/server';
import { Response } from '@/actions/types/response';

export interface ChartEditData {
  id: string;
  title: string;
  isPublic: boolean;
  userId: string;
  leftCategory: {
    id: string;
    name: string;
    elements: {
      id: string;
      name: string;
    }[];
  };
  rightCategory: {
    id: string;
    name: string;
    elements: {
      id: string;
      name: string;
    }[];
  };
  compatibilities: {
    id: string;
    leftElementId: string;
    rightElementId: string;
    compatibilityScore: number | null;
    reverseCompatibilityScore: number | null;
    note?: string;
  }[];
}

export const fetchChartEditData = async (props: {
  chartId: string;
}): Promise<Response<ChartEditData>> => {
  const supabase = await createClient();

  // chartIdの検証
  if (!props.chartId || props.chartId === 'undefined') {
    return {
      data: null,
      error: {
        message: 'Invalid chart ID',
      },
    };
  }

  try {
    const { data: chartData, error: chartError } = await supabase
      .from('compatibility_charts')
      .select(
        `
                id,
                title,
                is_public,
                user_id,
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
                    note,
                    compatibility_scores!compatibilities_compatibility_score_id_fkey (
                        score
                    ),
                    reverse_compatibility_scores:compatibility_scores!compatibilities_reverse_compatibility_score_id_fkey (
                        score
                    )
                )
            `
      )
      .eq('id', props.chartId)
      .eq('left_categories.side', 'left')
      .eq('right_categories.side', 'right')
      .single();

    if (chartError) {
      console.error('Chart fetch error:', chartError);
      return {
        data: null,
        error: {
          message: 'Failed to fetch chart edit data',
        },
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
        const sum = leftCompatibility?.reduce(
          (acc, compatibility) =>
            acc + compatibility.compatibility_scores.score,
          0
        );
        // 合計をlengthで割る
        return sum === undefined ||
          leftCompatibility === undefined ||
          leftCompatibility?.length === 0
          ? 0
          : sum / (leftCompatibility?.length || 0);
      } else {
        // 右側の場合はreverseCompatibilityScoreを使用
        const rightCompatibility = compatibilities?.filter((compatibility) => {
          return compatibility.right_element_id === elementId;
        });
        const sum = rightCompatibility?.reduce(
          (acc, compatibility) =>
            acc + compatibility.reverse_compatibility_scores.score,
          0
        );
        return sum === undefined ||
          rightCompatibility === undefined ||
          rightCompatibility?.length === 0
          ? 0
          : sum / (rightCompatibility?.length || 0);
      }
    };

    // 一時的にleftCategoryとrightCategoryのelementsを代入
    let leftElements = chartData.left_categories[0]?.elements.map(
      (element: any) => ({
        id: element.id,
        name: element.name,
        score: calculateScore(element.id, 'left'),
      })
    );
    let rightElements = chartData.right_categories[0]?.elements.map(
      (element: any) => ({
        id: element.id,
        name: element.name,
        score: calculateScore(element.id, 'right'),
      })
    );

    // ソート
    // 第一ソート: スコアが高い順
    // 第二ソート: 50音順
    leftElements = leftElements?.sort(
      (a, b) => b.score - a.score || a.name.localeCompare(b.name)
    );
    rightElements = rightElements?.sort(
      (a, b) => b.score - a.score || a.name.localeCompare(b.name)
    );

    return {
      data: {
        id: chartData.id,
        title: chartData.title,
        isPublic: chartData.is_public,
        userId: chartData.user_id,
        leftCategory: {
          id: chartData.left_categories[0]?.id || '',
          name: chartData.left_categories[0]?.name || '',
          elements:
            leftElements.map((element: any) => ({
              id: element.id,
              name: element.name,
            })) || [],
        },
        rightCategory: {
          id: chartData.right_categories[0]?.id || '',
          name: chartData.right_categories[0]?.name || '',
          elements:
            rightElements.map((element: any) => ({
              id: element.id,
              name: element.name,
            })) || [],
        },
        compatibilities:
          chartData.compatibilities?.map((compatibility: any) => ({
            id: compatibility.id,
            leftElementId: compatibility.left_element_id,
            rightElementId: compatibility.right_element_id,
            compatibilityScore: compatibility.compatibility_scores?.score || 0,
            reverseCompatibilityScore:
              compatibility.reverse_compatibility_scores?.score || 0,
            note: compatibility.note || null,
          })) || [],
      },
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error in fetchChartEditData:', error);
    return {
      data: null,
      error: {
        message: 'Unexpected error occurred',
      },
    };
  }
};
