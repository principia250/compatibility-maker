-- 初期スキーマ作成

-- 1. プランテーブル
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    max_charts INTEGER NOT NULL,
    monthly_price DECIMAL(10,2),
    yearly_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ユーザーテーブル
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    plan_expires_at TIMESTAMP WITH TIME ZONE,
    plan_updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 相性図テーブル
CREATE TABLE compatibility_charts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 比較項目テーブル（element_categories）
CREATE TABLE element_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    chart_id UUID NOT NULL REFERENCES compatibility_charts(id) ON DELETE CASCADE,
    side TEXT NOT NULL CHECK (side IN ('left', 'right')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 比較対象テーブル（elements）
CREATE TABLE elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    element_category_id UUID NOT NULL REFERENCES element_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 相性スコアテーブル
CREATE TABLE compatibility_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    score INTEGER NOT NULL CHECK (score BETWEEN -2 AND 2),
    notation TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 相性テーブル
CREATE TABLE compatibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    left_element_id UUID NOT NULL REFERENCES elements(id) ON DELETE CASCADE,
    right_element_id UUID NOT NULL REFERENCES elements(id) ON DELETE CASCADE,
    compatibility_score_id UUID NOT NULL REFERENCES compatibility_scores(id),
    reverse_compatibility_score_id UUID REFERENCES compatibility_scores(id),
    chart_id UUID NOT NULL REFERENCES compatibility_charts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. コメントテーブル
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chart_id UUID NOT NULL REFERENCES compatibility_charts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Goodテーブル
CREATE TABLE goods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chart_id UUID NOT NULL REFERENCES compatibility_charts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. ブックマークテーブル
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chart_id UUID NOT NULL REFERENCES compatibility_charts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_plan_id ON users(plan_id);
CREATE INDEX idx_users_plan_expires_at ON users(plan_expires_at);
CREATE INDEX idx_compatibility_charts_user_id ON compatibility_charts(user_id);
CREATE INDEX idx_compatibility_charts_is_public ON compatibility_charts(is_public);
CREATE INDEX idx_compatibility_charts_created_at ON compatibility_charts(created_at);
CREATE INDEX idx_element_categories_chart_id ON element_categories(chart_id);
CREATE INDEX idx_element_categories_side ON element_categories(chart_id, side);
CREATE INDEX idx_element_categories_name ON element_categories(name);
CREATE INDEX idx_elements_element_category_id ON elements(element_category_id);
CREATE INDEX idx_elements_name ON elements(name);
CREATE INDEX idx_compatibilities_left_element_id ON compatibilities(left_element_id);
CREATE INDEX idx_compatibilities_right_element_id ON compatibilities(right_element_id);
CREATE INDEX idx_compatibilities_score ON compatibilities(compatibility_score_id);
CREATE INDEX idx_compatibilities_chart_id ON compatibilities(chart_id);
CREATE INDEX idx_comments_chart_id ON comments(chart_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_goods_chart_id ON goods(chart_id);
CREATE INDEX idx_goods_user_id ON goods(user_id);
CREATE INDEX idx_bookmarks_chart_id ON bookmarks(chart_id);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);

-- ユニーク制約
CREATE UNIQUE INDEX idx_compatibilities_element_pair ON compatibilities(left_element_id, right_element_id);
CREATE UNIQUE INDEX idx_goods_user_chart_unique ON goods(user_id, chart_id);
CREATE UNIQUE INDEX idx_bookmarks_user_chart_unique ON bookmarks(user_id, chart_id);

-- updated_at自動更新用のファンクション
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにupdated_at自動更新トリガーを設定
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compatibility_charts_updated_at BEFORE UPDATE ON compatibility_charts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_element_categories_updated_at BEFORE UPDATE ON element_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_elements_updated_at BEFORE UPDATE ON elements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compatibility_scores_updated_at BEFORE UPDATE ON compatibility_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compatibilities_updated_at BEFORE UPDATE ON compatibilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goods_updated_at BEFORE UPDATE ON goods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookmarks_updated_at BEFORE UPDATE ON bookmarks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
