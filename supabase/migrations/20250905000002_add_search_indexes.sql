-- 検索機能用のインデックスを追加

-- pg_trgm拡張を有効化（部分一致検索用）
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. タイトル検索用のインデックス（大文字小文字を区別しない）
CREATE INDEX IF NOT EXISTS idx_compatibility_charts_title_ilike ON compatibility_charts 
USING gin(title gin_trgm_ops);

-- 2. 作成者名検索用のインデックス（大文字小文字を区別しない）
CREATE INDEX IF NOT EXISTS idx_users_username_ilike ON users 
USING gin(username gin_trgm_ops);

-- 3. 更新日並び替え用のインデックス
CREATE INDEX IF NOT EXISTS idx_compatibility_charts_updated_at_desc ON compatibility_charts(updated_at DESC);

-- 4. Good数カウント用のインデックス（既存の場合はスキップ）
CREATE INDEX IF NOT EXISTS idx_goods_chart_id ON goods(chart_id);

-- 5. 公開チャート検索用の複合インデックス
CREATE INDEX IF NOT EXISTS idx_compatibility_charts_public_updated ON compatibility_charts(is_public, updated_at DESC) 
WHERE is_public = true;

-- 6. 外部キー検索用のインデックス
CREATE INDEX IF NOT EXISTS idx_compatibility_charts_user_id ON compatibility_charts(user_id);
