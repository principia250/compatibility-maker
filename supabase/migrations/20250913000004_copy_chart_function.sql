-- Function to copy a chart for another user
CREATE OR REPLACE FUNCTION copy_chart(
  source_chart_id UUID,
  target_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_chart_id UUID;
  chart_data RECORD;
  left_category_id UUID;
  right_category_id UUID;
  element_record RECORD;
  compatibility_record RECORD;
BEGIN
  -- Check if source chart exists and can be copied
  SELECT * INTO chart_data
  FROM compatibility_charts
  WHERE id = source_chart_id AND can_copy = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Chart not found or cannot be copied';
  END IF;
  
  
  -- Create new chart
  INSERT INTO compatibility_charts (
    user_id,
    title,
    note,
    is_public,
    can_copy
  ) VALUES (
    target_user_id,
    chart_data.title || ' (Copy)',
    chart_data.note,
    false, -- Copied charts are private by default
    false  -- Copied charts cannot be copied by default
  ) RETURNING id INTO new_chart_id;
  
  -- Copy left category
  INSERT INTO categories (
    chart_id,
    name,
    side
  ) VALUES (
    new_chart_id,
    chart_data.left_category_name,
    'left'
  ) RETURNING id INTO left_category_id;
  
  -- Copy right category
  INSERT INTO categories (
    chart_id,
    name,
    side
  ) VALUES (
    new_chart_id,
    chart_data.right_category_name,
    'right'
  ) RETURNING id INTO right_category_id;
  
  -- Copy left elements
  FOR element_record IN
    SELECT * FROM elements
    WHERE category_id = chart_data.left_category_id
  LOOP
    INSERT INTO elements (
      category_id,
      name
    ) VALUES (
      left_category_id,
      element_record.name
    );
  END LOOP;
  
  -- Copy right elements
  FOR element_record IN
    SELECT * FROM elements
    WHERE category_id = chart_data.right_category_id
  LOOP
    INSERT INTO elements (
      category_id,
      name
    ) VALUES (
      right_category_id,
      element_record.name
    );
  END LOOP;
  
  -- Copy compatibilities
  FOR compatibility_record IN
    SELECT 
      c.*,
      le.name as left_element_name,
      re.name as right_element_name
    FROM compatibilities c
    JOIN elements le ON c.left_element_id = le.id
    JOIN elements re ON c.right_element_id = re.id
    WHERE c.chart_id = source_chart_id
  LOOP
    -- Get the new element IDs
    DECLARE
      new_left_element_id UUID;
      new_right_element_id UUID;
    BEGIN
      SELECT id INTO new_left_element_id
      FROM elements
      WHERE category_id = left_category_id AND name = compatibility_record.left_element_name;
      
      SELECT id INTO new_right_element_id
      FROM elements
      WHERE category_id = right_category_id AND name = compatibility_record.right_element_name;
      
      INSERT INTO compatibilities (
        chart_id,
        left_element_id,
        right_element_id,
        score,
        score_notation,
        note
      ) VALUES (
        new_chart_id,
        new_left_element_id,
        new_right_element_id,
        compatibility_record.score,
        compatibility_record.score_notation,
        compatibility_record.note
      );
    END;
  END LOOP;
  
  RETURN new_chart_id;
END;
$$;

-- Add comment
COMMENT ON FUNCTION copy_chart(UUID, UUID) IS 'Copy a chart for another user with all its data';
