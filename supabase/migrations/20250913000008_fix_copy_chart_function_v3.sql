-- Fix copy_chart function based on duplicate_chart function structure
CREATE OR REPLACE FUNCTION copy_chart(
  source_chart_id UUID,
  target_user_id UUID
)
RETURNS UUID
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
    title
  INTO v_original_chart
  FROM compatibility_charts
  WHERE id = source_chart_id AND can_copy = true;
  
  -- チャートが存在しないか、コピー不可の場合
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Chart not found or cannot be copied';
  END IF;
  
  -- 元のカテゴリ情報を取得
  SELECT * INTO v_original_left_category
  FROM element_categories
  WHERE chart_id = source_chart_id AND side = 'left';
  
  SELECT * INTO v_original_right_category
  FROM element_categories
  WHERE chart_id = source_chart_id AND side = 'right';
  
  -- 新しいチャートを作成
  INSERT INTO compatibility_charts (
    title,
    user_id,
    is_public,
    can_copy
  ) VALUES (
    v_original_chart.title || ' (Copy)',
    target_user_id,
    FALSE, -- 複製時は非公開
    FALSE  -- 複製時はコピー不可
  ) RETURNING id INTO v_new_chart_id;
  
  -- 新しい左カテゴリを作成
  INSERT INTO element_categories (
    name,
    chart_id,
    side
  ) VALUES (
    v_original_left_category.name,
    v_new_chart_id,
    'left'
  ) RETURNING id INTO v_new_left_category_id;
  
  -- 新しい右カテゴリを作成
  INSERT INTO element_categories (
    name,
    chart_id,
    side
  ) VALUES (
    v_original_right_category.name,
    v_new_chart_id,
    'right'
  ) RETURNING id INTO v_new_right_category_id;
  
  -- 左カテゴリの要素を複製
  FOR v_element IN 
    SELECT id, name 
    FROM elements 
    WHERE element_category_id = v_original_left_category.id
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
    WHERE element_category_id = v_original_right_category.id
  LOOP
    INSERT INTO elements (name, element_category_id)
    VALUES (v_element.name, v_new_right_category_id)
    RETURNING id INTO v_new_right_element_id;
    
    -- IDマッピングを保存
    v_right_element_map := v_right_element_map || jsonb_build_object(v_element.id::TEXT, v_new_right_element_id::TEXT);
  END LOOP;
  
  -- 相性データを複製（noteフィールドを含む）
  FOR v_compatibility IN 
    SELECT 
      left_element_id,
      right_element_id,
      compatibility_score_id,
      reverse_compatibility_score_id,
      note
    FROM compatibilities
    WHERE chart_id = source_chart_id
  LOOP
    -- 新しい要素IDを取得
    v_new_left_element_id := (v_left_element_map ->> v_compatibility.left_element_id::TEXT)::UUID;
    v_new_right_element_id := (v_right_element_map ->> v_compatibility.right_element_id::TEXT)::UUID;
    
    -- 新しい相性データを挿入（noteフィールドを含む）
    INSERT INTO compatibilities (
      chart_id,
      left_element_id,
      right_element_id,
      compatibility_score_id,
      reverse_compatibility_score_id,
      note
    ) VALUES (
      v_new_chart_id,
      v_new_left_element_id,
      v_new_right_element_id,
      v_compatibility.compatibility_score_id,
      v_compatibility.reverse_compatibility_score_id,
      v_compatibility.note
    );
  END LOOP;
  
  -- 成功を返す
  RETURN v_new_chart_id;
  
EXCEPTION
  WHEN OTHERS THEN
    -- エラーが発生した場合
    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
    RAISE EXCEPTION 'Error copying chart: %', v_error_message;
END;
$$;

-- Add comment
COMMENT ON FUNCTION copy_chart(UUID, UUID) IS 'Copy a chart for another user with all its data';
