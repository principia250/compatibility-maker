'use server';

import { createClient } from '@/lib/supabase/server';
import { Response } from '@/actions/types/response';
import { ChartEditData, fetchChartEditData } from './fetch';

// PostgreSQL関数の型定義
type SaveChartDataResult = {
  success: boolean;
  error_message?: string;
};

export const saveChartData = async (
  chartData: ChartEditData
): Promise<Response<ChartEditData>> => {
  try {
    const supabase = await createClient();

    // データをJSONB形式に変換
    const leftElements = chartData.leftCategory.elements.map(el => ({
      id: el.id,
      name: el.name
    }));

    const rightElements = chartData.rightCategory.elements.map(el => ({
      id: el.id,
      name: el.name
    }));

    const compatibilities = chartData.compatibilities.map(comp => ({
      leftElementId: comp.leftElementId,
      rightElementId: comp.rightElementId,
      compatibilityScore: comp.compatibilityScore,
      reverseCompatibilityScore: comp.reverseCompatibilityScore,
      note: comp.note
    }));

    // PostgreSQL関数を呼び出し
    const { data, error } = await supabase.rpc('save_chart_data', {
      p_chart_id: chartData.id,
      p_title: chartData.title,
      p_is_public: chartData.isPublic,
      p_left_category_name: chartData.leftCategory.name,
      p_right_category_name: chartData.rightCategory.name,
      p_left_elements: leftElements,
      p_right_elements: rightElements,
      p_compatibilities: compatibilities
    }) as { data: SaveChartDataResult[] | null; error: Error | null };

    if (error) {
      console.error('save_chart_data RPC error:', error);
      return { data: null, error: { message: 'Failed to save chart data' } };
    }

    if (!data || data.length === 0) {
      return { data: null, error: { message: 'Failed to save chart data' } };
    }

    const result = data[0];

    if (!result.success) {
      return {
        data: null,
        error: { message: result.error_message || 'Failed to save chart data' }
      };
    }

    // 保存完了後、最新データを再取得
    const { data: updatedChartData, error: fetchError } = 
      await fetchChartEditData({ chartId: chartData.id });

    if (fetchError) {
      console.error('Fetch updated chart data error:', fetchError);
      return {
        data: null,
        error: { message: 'Failed to fetch updated chart data' }
      };
    }

    return { data: updatedChartData, error: null };
  } catch (error) {
    console.error('Unexpected error in saveChartData:', error);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};
