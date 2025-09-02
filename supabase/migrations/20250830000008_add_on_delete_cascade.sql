-- Ensure ON DELETE CASCADE for all child relations
-- This migration finds existing FK constraints and recreates them with ON DELETE CASCADE

DO $$
DECLARE
  r RECORD;
BEGIN
  -- Helper to (re)create a FK with ON DELETE CASCADE
  -- Arguments:
  --   p_table, p_columns, p_ref_table, p_ref_columns, p_constraint_name
  PERFORM 1; -- no-op to keep DO block structure

  -- element_categories.chart_id -> compatibility_charts.id
  SELECT conname INTO r
  FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid AND t.relname = 'element_categories'
  WHERE c.contype = 'f';
  IF r.conname IS NOT NULL THEN
    ALTER TABLE element_categories DROP CONSTRAINT IF EXISTS element_categories_chart_id_fkey;
  END IF;
  ALTER TABLE element_categories
    ADD CONSTRAINT element_categories_chart_id_fkey
    FOREIGN KEY (chart_id) REFERENCES compatibility_charts(id) ON DELETE CASCADE;

  -- elements.element_category_id -> element_categories.id
  SELECT conname INTO r
  FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid AND t.relname = 'elements'
  WHERE c.contype = 'f' AND c.conname = 'elements_element_category_id_fkey';
  IF r.conname IS NOT NULL THEN
    ALTER TABLE elements DROP CONSTRAINT IF EXISTS elements_element_category_id_fkey;
  END IF;
  ALTER TABLE elements
    ADD CONSTRAINT elements_element_category_id_fkey
    FOREIGN KEY (element_category_id) REFERENCES element_categories(id) ON DELETE CASCADE;

  -- compatibilities.left_element_id -> elements.id
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'compatibilities_left_element_id_fkey') THEN
    ALTER TABLE compatibilities DROP CONSTRAINT compatibilities_left_element_id_fkey;
  END IF;
  ALTER TABLE compatibilities
    ADD CONSTRAINT compatibilities_left_element_id_fkey
    FOREIGN KEY (left_element_id) REFERENCES elements(id) ON DELETE CASCADE;

  -- compatibilities.right_element_id -> elements.id
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'compatibilities_right_element_id_fkey') THEN
    ALTER TABLE compatibilities DROP CONSTRAINT compatibilities_right_element_id_fkey;
  END IF;
  ALTER TABLE compatibilities
    ADD CONSTRAINT compatibilities_right_element_id_fkey
    FOREIGN KEY (right_element_id) REFERENCES elements(id) ON DELETE CASCADE;

  -- compatibilities.chart_id -> compatibility_charts.id
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'compatibilities_chart_id_fkey') THEN
    ALTER TABLE compatibilities DROP CONSTRAINT compatibilities_chart_id_fkey;
  END IF;
  ALTER TABLE compatibilities
    ADD CONSTRAINT compatibilities_chart_id_fkey
    FOREIGN KEY (chart_id) REFERENCES compatibility_charts(id) ON DELETE CASCADE;

  -- comments.chart_id -> compatibility_charts.id
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_chart_id_fkey') THEN
    ALTER TABLE comments DROP CONSTRAINT comments_chart_id_fkey;
  END IF;
  ALTER TABLE comments
    ADD CONSTRAINT comments_chart_id_fkey
    FOREIGN KEY (chart_id) REFERENCES compatibility_charts(id) ON DELETE CASCADE;

  -- comments.user_id -> users.id
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_user_id_fkey') THEN
    ALTER TABLE comments DROP CONSTRAINT comments_user_id_fkey;
  END IF;
  ALTER TABLE comments
    ADD CONSTRAINT comments_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

  -- goods.chart_id -> compatibility_charts.id
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'goods_chart_id_fkey') THEN
    ALTER TABLE goods DROP CONSTRAINT goods_chart_id_fkey;
  END IF;
  ALTER TABLE goods
    ADD CONSTRAINT goods_chart_id_fkey
    FOREIGN KEY (chart_id) REFERENCES compatibility_charts(id) ON DELETE CASCADE;

  -- goods.user_id -> users.id
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'goods_user_id_fkey') THEN
    ALTER TABLE goods DROP CONSTRAINT goods_user_id_fkey;
  END IF;
  ALTER TABLE goods
    ADD CONSTRAINT goods_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

  -- bookmarks.chart_id -> compatibility_charts.id
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookmarks_chart_id_fkey') THEN
    ALTER TABLE bookmarks DROP CONSTRAINT bookmarks_chart_id_fkey;
  END IF;
  ALTER TABLE bookmarks
    ADD CONSTRAINT bookmarks_chart_id_fkey
    FOREIGN KEY (chart_id) REFERENCES compatibility_charts(id) ON DELETE CASCADE;

  -- bookmarks.user_id -> users.id
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookmarks_user_id_fkey') THEN
    ALTER TABLE bookmarks DROP CONSTRAINT bookmarks_user_id_fkey;
  END IF;
  ALTER TABLE bookmarks
    ADD CONSTRAINT bookmarks_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

  -- compatibility_charts.user_id -> users.id
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'compatibility_charts_user_id_fkey') THEN
    ALTER TABLE compatibility_charts DROP CONSTRAINT compatibility_charts_user_id_fkey;
  END IF;
  ALTER TABLE compatibility_charts
    ADD CONSTRAINT compatibility_charts_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
END $$;


