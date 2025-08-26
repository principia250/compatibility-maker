-- 初期スキーマのマイグレーションファイル
-- 作成日: 2025-08-24
-- 説明: 相性メーカーアプリの初期データベーススキーマ

-- 1. updated_at自動更新用の関数を作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. ユーザーテーブル (users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'supporter', 'premium')),
    plan_expires_at TIMESTAMP WITH TIME ZONE,
    plan_updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_plan_type ON users(plan_type);
CREATE INDEX idx_users_plan_expires_at ON users(plan_expires_at);

-- トリガー: updated_at自動更新
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 3. プランテーブル (plans)
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    max_charts INTEGER NOT NULL,
    monthly_price DECIMAL(10,2),
    yearly_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_plans_name ON plans(name);

-- トリガー: updated_at自動更新
CREATE TRIGGER update_plans_updated_at 
    BEFORE UPDATE ON plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. 相性図テーブル (compatibility_charts)
CREATE TABLE compatibility_charts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_compatibility_charts_user_id ON compatibility_charts(user_id);
CREATE INDEX idx_compatibility_charts_title ON compatibility_charts(title);
CREATE INDEX idx_compatibility_charts_is_public ON compatibility_charts(is_public);
CREATE INDEX idx_compatibility_charts_created_at ON compatibility_charts(created_at);

-- トリガー: updated_at自動更新
CREATE TRIGGER update_compatibility_charts_updated_at 
    BEFORE UPDATE ON compatibility_charts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. 比較対象テーブル (elements)
CREATE TABLE elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    chart_id UUID NOT NULL REFERENCES compatibility_charts(id) ON DELETE CASCADE,
    side TEXT NOT NULL CHECK (side IN ('left', 'right')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_elements_chart_id ON elements(chart_id);
CREATE INDEX idx_elements_side ON elements(chart_id, side);
CREATE INDEX idx_elements_name ON elements(chart_id, name);

-- トリガー: updated_at自動更新
CREATE TRIGGER update_elements_updated_at 
    BEFORE UPDATE ON elements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. 相性スコアテーブル (compatibility_scores)
CREATE TABLE compatibility_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    score INTEGER NOT NULL CHECK (score BETWEEN -2 AND 2),
    notation TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_compatibility_scores_score ON compatibility_scores(score);
CREATE INDEX idx_compatibility_scores_notation ON compatibility_scores(notation);

-- トリガー: updated_at自動更新
CREATE TRIGGER update_compatibility_scores_updated_at 
    BEFORE UPDATE ON compatibility_scores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. 比較項目テーブル (element_categories)
CREATE TABLE element_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    element_id UUID NOT NULL REFERENCES elements(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_element_categories_element_id ON element_categories(element_id);
CREATE INDEX idx_element_categories_name ON element_categories(name);

-- トリガー: updated_at自動更新
CREATE TRIGGER update_element_categories_updated_at 
    BEFORE UPDATE ON element_categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. 相性テーブル (compatibilities)
CREATE TABLE compatibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    left_element_id UUID NOT NULL REFERENCES elements(id) ON DELETE CASCADE,
    right_element_id UUID NOT NULL REFERENCES elements(id) ON DELETE CASCADE,
    compatibility_score_id UUID NOT NULL REFERENCES compatibility_scores(id),
    reverse_compatibility_score_id UUID REFERENCES compatibility_scores(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_compatibilities_left_element_id ON compatibilities(left_element_id);
CREATE INDEX idx_compatibilities_right_element_id ON compatibilities(right_element_id);
CREATE INDEX idx_compatibilities_score ON compatibilities(compatibility_score_id);
CREATE UNIQUE INDEX idx_compatibilities_element_pair ON compatibilities(left_element_id, right_element_id);

-- トリガー: updated_at自動更新
CREATE TRIGGER update_compatibilities_updated_at 
    BEFORE UPDATE ON compatibilities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. コメントテーブル (comments)
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chart_id UUID NOT NULL REFERENCES compatibility_charts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_chart_id ON comments(chart_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);

-- トリガー: updated_at自動更新
CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Goodテーブル (goods)
CREATE TABLE goods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chart_id UUID NOT NULL REFERENCES compatibility_charts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, chart_id)
);

-- インデックス
CREATE INDEX idx_goods_user_id ON goods(user_id);
CREATE INDEX idx_goods_chart_id ON goods(chart_id);
CREATE INDEX idx_goods_created_at ON goods(created_at);

-- トリガー: updated_at自動更新
CREATE TRIGGER update_goods_updated_at 
    BEFORE UPDATE ON goods 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 11. ブックマークテーブル (bookmarks)
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chart_id UUID NOT NULL REFERENCES compatibility_charts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, chart_id)
);

-- インデックス
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_chart_id ON bookmarks(chart_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at);

-- トリガー: updated_at自動更新
CREATE TRIGGER update_bookmarks_updated_at 
    BEFORE UPDATE ON bookmarks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
