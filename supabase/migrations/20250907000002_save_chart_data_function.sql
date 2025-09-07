-- チャート保存用のPostgreSQL関数
CREATE OR REPLACE FUNCTION save_chart_data(
    p_chart_id UUID,
    p_title TEXT,
    p_is_public BOOLEAN,
    p_left_category_name TEXT,
    p_right_category_name TEXT,
    p_left_elements JSONB,
    p_right_elements JSONB,
    p_compatibilities JSONB
)
RETURNS TABLE(
    success BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_left_category_id UUID;
    v_right_category_id UUID;
    v_element JSONB;
    v_compatibility JSONB;
    v_new_element_id UUID;
    v_left_element_map JSONB := '{}';
    v_right_element_map JSONB := '{}';
    v_score_to_id_map JSONB := '{}';
    v_score_record RECORD;
    v_error_message TEXT;
BEGIN
    -- 1. チャート基本情報の更新
    UPDATE compatibility_charts
    SET 
        title = p_title,
        is_public = p_is_public,
        updated_at = NOW()
    WHERE id = p_chart_id;
    
    -- 2. カテゴリ名の更新
    SELECT id INTO v_left_category_id
    FROM element_categories
    WHERE chart_id = p_chart_id AND side = 'left';
    
    UPDATE element_categories
    SET name = p_left_category_name
    WHERE id = v_left_category_id;
    
    SELECT id INTO v_right_category_id
    FROM element_categories
    WHERE chart_id = p_chart_id AND side = 'right';
    
    UPDATE element_categories
    SET name = p_right_category_name
    WHERE id = v_right_category_id;
    
    -- 3. 既存の要素を削除
    DELETE FROM elements WHERE element_category_id = v_left_category_id;
    DELETE FROM elements WHERE element_category_id = v_right_category_id;
    
    -- 4. 左要素の挿入
    FOR v_element IN SELECT * FROM jsonb_array_elements(p_left_elements)
    LOOP
        INSERT INTO elements (name, element_category_id)
        VALUES (v_element->>'name', v_left_category_id)
        RETURNING id INTO v_new_element_id;
        
        v_left_element_map := v_left_element_map || 
            jsonb_build_object(v_element->>'id', v_new_element_id::TEXT);
    END LOOP;
    
    -- 5. 右要素の挿入
    FOR v_element IN SELECT * FROM jsonb_array_elements(p_right_elements)
    LOOP
        INSERT INTO elements (name, element_category_id)
        VALUES (v_element->>'name', v_right_category_id)
        RETURNING id INTO v_new_element_id;
        
        v_right_element_map := v_right_element_map || 
            jsonb_build_object(v_element->>'id', v_new_element_id::TEXT);
    END LOOP;
    
    -- 6. スコアIDマッピングを作成
    FOR v_score_record IN SELECT id, score FROM compatibility_scores
    LOOP
        v_score_to_id_map := v_score_to_id_map || 
            jsonb_build_object(v_score_record.score::TEXT, v_score_record.id::TEXT);
    END LOOP;
    
    -- 7. 既存の相性データを削除
    DELETE FROM compatibilities WHERE chart_id = p_chart_id;
    
    -- 8. 新しい相性データを挿入
    FOR v_compatibility IN SELECT * FROM jsonb_array_elements(p_compatibilities)
    LOOP
        -- 一時IDを実際のIDに変換
        DECLARE
            v_left_element_id UUID := (v_left_element_map ->> (v_compatibility->>'leftElementId'))::UUID;
            v_right_element_id UUID := (v_right_element_map ->> (v_compatibility->>'rightElementId'))::UUID;
            v_compatibility_score_id UUID := (v_score_to_id_map ->> (v_compatibility->>'compatibilityScore')::TEXT)::UUID;
            v_reverse_compatibility_score_id UUID := (v_score_to_id_map ->> (v_compatibility->>'reverseCompatibilityScore')::TEXT)::UUID;
        BEGIN
            INSERT INTO compatibilities (
                chart_id,
                left_element_id,
                right_element_id,
                compatibility_score_id,
                reverse_compatibility_score_id,
                note
            ) VALUES (
                p_chart_id,
                v_left_element_id,
                v_right_element_id,
                v_compatibility_score_id,
                v_reverse_compatibility_score_id,
                v_compatibility->>'note'
            );
        END;
    END LOOP;
    
    -- 成功を返す
    RETURN QUERY SELECT TRUE, NULL::TEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        -- エラーが発生した場合
        GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
        RETURN QUERY SELECT FALSE, v_error_message;
END;
$$;

-- 関数の実行権限を付与
GRANT EXECUTE ON FUNCTION save_chart_data(UUID, TEXT, BOOLEAN, TEXT, TEXT, JSONB, JSONB, JSONB) TO authenticated;
