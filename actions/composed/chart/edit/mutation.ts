'use server';

import { createClient } from '@/lib/supabase/server';
import { Response } from '@/actions/types/response';
import { ChartEditData, fetchChartEditData } from './fetch';
import {
  TITLE_MAX_LENGTH,
  CATEGORY_NAME_MAX_LENGTH,
  ELEMENT_NAME_MAX_LENGTH,
  COMPATIBILITY_NOTE_MAX_LENGTH,
} from '@/constants/input-length';

// PostgreSQL関数の型定義
type SaveChartDataResult = {
  success: boolean;
  error_message?: string;
};

export const saveChartData = async (
  chartData: ChartEditData
): Promise<Response<ChartEditData>> => {
  try {
    // バリデーション
    if (!chartData.title || chartData.title.trim().length === 0) {
      return { data: null, error: { message: 'Title is required' } };
    }
    if (chartData.title.length > TITLE_MAX_LENGTH) {
      return {
        data: null,
        error: {
          message: `Title must be ${TITLE_MAX_LENGTH} characters or less`,
        },
      };
    }

    if (
      !chartData.leftCategory.name ||
      chartData.leftCategory.name.trim().length === 0
    ) {
      return {
        data: null,
        error: { message: 'Left category name is required' },
      };
    }
    if (chartData.leftCategory.name.length > CATEGORY_NAME_MAX_LENGTH) {
      return {
        data: null,
        error: {
          message: `Left category name must be ${CATEGORY_NAME_MAX_LENGTH} characters or less`,
        },
      };
    }

    if (
      !chartData.rightCategory.name ||
      chartData.rightCategory.name.trim().length === 0
    ) {
      return {
        data: null,
        error: { message: 'Right category name is required' },
      };
    }
    if (chartData.rightCategory.name.length > CATEGORY_NAME_MAX_LENGTH) {
      return {
        data: null,
        error: {
          message: `Right category name must be ${CATEGORY_NAME_MAX_LENGTH} characters or less`,
        },
      };
    }

    // 要素名のバリデーション
    for (const element of [
      ...chartData.leftCategory.elements,
      ...chartData.rightCategory.elements,
    ]) {
      if (!element.name || element.name.trim().length === 0) {
        return { data: null, error: { message: 'Element name is required' } };
      }
      if (element.name.length > ELEMENT_NAME_MAX_LENGTH) {
        return {
          data: null,
          error: {
            message: `Element name must be ${ELEMENT_NAME_MAX_LENGTH} characters or less`,
          },
        };
      }
    }

    // 相性ノートのバリデーション
    for (const compatibility of chartData.compatibilities) {
      if (
        compatibility.note &&
        compatibility.note.length > COMPATIBILITY_NOTE_MAX_LENGTH
      ) {
        return {
          data: null,
          error: {
            message: `Compatibility note must be ${COMPATIBILITY_NOTE_MAX_LENGTH} characters or less`,
          },
        };
      }
    }

    const supabase = await createClient();

    // データをJSONB形式に変換
    const leftElements = chartData.leftCategory.elements.map((el) => ({
      id: el.id,
      name: el.name,
    }));

    const rightElements = chartData.rightCategory.elements.map((el) => ({
      id: el.id,
      name: el.name,
    }));

    const compatibilities = chartData.compatibilities.map((comp) => ({
      leftElementId: comp.leftElementId,
      rightElementId: comp.rightElementId,
      compatibilityScore: comp.compatibilityScore,
      reverseCompatibilityScore: comp.reverseCompatibilityScore,
      note: comp.note,
    }));

    // PostgreSQL関数を呼び出し
    const { data, error } = (await supabase.rpc('save_chart_data', {
      p_chart_id: chartData.id,
      p_title: chartData.title,
      p_is_public: chartData.isPublic,
      p_can_copy: chartData.canCopy,
      p_left_category_name: chartData.leftCategory.name,
      p_right_category_name: chartData.rightCategory.name,
      p_left_elements: leftElements,
      p_right_elements: rightElements,
      p_compatibilities: compatibilities,
    })) as { data: SaveChartDataResult[] | null; error: Error | null };

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
        error: { message: result.error_message || 'Failed to save chart data' },
      };
    }

    // 保存完了後、最新データを再取得
    const { data: updatedChartData, error: fetchError } =
      await fetchChartEditData({ chartId: chartData.id });

    if (fetchError) {
      console.error('Fetch updated chart data error:', fetchError);
      return {
        data: null,
        error: { message: 'Failed to fetch updated chart data' },
      };
    }

    return { data: updatedChartData, error: null };
  } catch (error) {
    console.error('Unexpected error in saveChartData:', error);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};
