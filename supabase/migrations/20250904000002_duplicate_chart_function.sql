-- チャート複製用のPostgreSQL関数を作成
CREATE OR REPLACE FUNCTION duplicate_chart(
    p_chart_id UUID,
    p_user_id UUID
)
RETURNS TABLE(
    new_chart_id UUID,
    success BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_original_chart RECORD;
    v_original_left_category RECORD;
    v_original_right_category RECORD;
    v_new_chart_id UUID;
    v_new_left_category_id UUID;
    v_new_right_category_id UUID;
    v_element RECORD;
    v_compatibility RECORD;
    v_left_element_map JSONB := '{}';
    v_right_element_map JSONB := '{}';
    v_new_left_element_id UUID;
    v_new_right_element_id UUID;
    v_error_message TEXT;
BEGIN
    -- 元のチャート情報を取得
    SELECT 
        id,
        title,
        left_category_id,
        right_category_id
    INTO v_original_chart
    FROM compatibility_charts
    WHERE id = p_chart_id 
    AND user_id = p_user_id;
    
    -- チャートが存在しないか、権限がない場合
    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::UUID, FALSE, 'Chart not found or access denied'::TEXT;
        RETURN;
    END IF;
    
    -- 元のカテゴリ情報を取得
    SELECT * INTO v_original_left_category
    FROM element_categories
    WHERE id = v_original_chart.left_category_id;
    
    SELECT * INTO v_original_right_category
    FROM element_categories
    WHERE id = v_original_chart.right_category_id;
    
    -- 新しい左カテゴリを作成
    INSERT INTO element_categories (
        name,
        chart_id
    ) VALUES (
        v_original_left_category.name,
        NULL -- 後でチャートIDを更新
    ) RETURNING id INTO v_new_left_category_id;
    
    -- 新しい右カテゴリを作成
    INSERT INTO element_categories (
        name,
        chart_id
    ) VALUES (
        v_original_right_category.name,
        NULL -- 後でチャートIDを更新
    ) RETURNING id INTO v_new_right_category_id;
    
    -- 新しいチャートを作成
    INSERT INTO compatibility_charts (
        title,
        user_id,
        is_public,
        left_category_id,
        right_category_id
    ) VALUES (
        v_original_chart.title || ' (Copy)',
        p_user_id,
        FALSE, -- 複製時は非公開
        v_new_left_category_id,
        v_new_right_category_id
    ) RETURNING id INTO v_new_chart_id;
    
    -- カテゴリのchart_idを更新
    UPDATE element_categories 
    SET chart_id = v_new_chart_id 
    WHERE id = v_new_left_category_id;
    
    UPDATE element_categories 
    SET chart_id = v_new_chart_id 
    WHERE id = v_new_right_category_id;
    
    -- 左カテゴリの要素を複製
    FOR v_element IN 
        SELECT id, name 
        FROM elements 
        WHERE element_category_id = v_original_chart.left_category_id
    LOOP
        INSERT INTO elements (name, element_category_id)
        VALUES (v_element.name, v_new_left_category_id)
        RETURNING id INTO v_new_left_element_id;
        
        -- IDマッピングを保存
        v_left_element_map := v_left_element_map || jsonb_build_object(v_element.id::TEXT, v_new_left_element_id::TEXT);
    END LOOP;
    
    -- 右カテゴリの要素を複製
    FOR v_element IN 
        SELECT id, name 
        FROM elements 
        WHERE element_category_id = v_original_chart.right_category_id
    LOOP
        INSERT INTO elements (name, element_category_id)
        VALUES (v_element.name, v_new_right_category_id)
        RETURNING id INTO v_new_right_element_id;
        
        -- IDマッピングを保存
        v_right_element_map := v_right_element_map || jsonb_build_object(v_element.id::TEXT, v_new_right_element_id::TEXT);
    END LOOP;
    
    -- 相性データを複製
    FOR v_compatibility IN 
        SELECT 
            left_element_id,
            right_element_id,
            compatibility_score_id,
            reverse_compatibility_score_id
        FROM compatibilities
        WHERE chart_id = p_chart_id
    LOOP
        -- 新しい要素IDを取得
        v_new_left_element_id := (v_left_element_map ->> v_compatibility.left_element_id::TEXT)::UUID;
        v_new_right_element_id := (v_right_element_map ->> v_compatibility.right_element_id::TEXT)::UUID;
        
        -- 新しい相性データを挿入
        INSERT INTO compatibilities (
            chart_id,
            left_element_id,
            right_element_id,
            compatibility_score_id,
            reverse_compatibility_score_id
        ) VALUES (
            v_new_chart_id,
            v_new_left_element_id,
            v_new_right_element_id,
            v_compatibility.compatibility_score_id,
            v_compatibility.reverse_compatibility_score_id
        );
    END LOOP;
    
    -- 成功を返す
    RETURN QUERY SELECT v_new_chart_id, TRUE, NULL::TEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        -- エラーが発生した場合
        GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
        RETURN QUERY SELECT NULL::UUID, FALSE, v_error_message;
END;
$$;

-- 関数の実行権限を付与
GRANT EXECUTE ON FUNCTION duplicate_chart(UUID, UUID) TO authenticated;
