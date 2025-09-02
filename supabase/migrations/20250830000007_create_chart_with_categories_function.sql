-- チャートとカテゴリを一括作成するPostgreSQL関数
CREATE OR REPLACE FUNCTION create_chart_with_categories(
  p_title TEXT,
  p_is_public BOOLEAN,
  p_user_id UUID
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  is_public BOOLEAN,
  user_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_chart_id UUID;
BEGIN
  -- チャートを作成
  INSERT INTO compatibility_charts (title, is_public, user_id)
  VALUES (p_title, p_is_public, p_user_id)
  RETURNING compatibility_charts.id INTO v_chart_id;
  
  -- 要素カテゴリを作成
  INSERT INTO element_categories (chart_id, name, side)
  VALUES 
    (v_chart_id, 'side1', 'left'),
    (v_chart_id, 'side2', 'right');
  
  -- 作成されたチャート情報を返す
  RETURN QUERY
  SELECT c.id, c.title, c.is_public, c.user_id
  FROM compatibility_charts c
  WHERE c.id = v_chart_id;
END;
$$;
