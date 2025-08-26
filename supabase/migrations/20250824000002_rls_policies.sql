-- Row Level Security (RLS) 設定用のマイグレーションファイル
-- 作成日: 2025-08-24
-- 説明: 相性メーカーアプリのセキュリティポリシー設定

-- 1. 各テーブルでRLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE element_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- 2. ユーザーテーブルのポリシー
-- ユーザーは自分のプロフィールのみ閲覧・更新可能
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- 3. プランテーブルのポリシー
-- プラン情報は誰でも閲覧可能
CREATE POLICY "Plans are viewable by everyone" ON plans
    FOR SELECT USING (true);

-- 4. 相性図テーブルのポリシー
-- 作成者は自分の相性図を管理可能
CREATE POLICY "Users can view own charts" ON compatibility_charts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own charts" ON compatibility_charts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own charts" ON compatibility_charts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own charts" ON compatibility_charts
    FOR DELETE USING (auth.uid() = user_id);

-- 公開された相性図は誰でも閲覧可能
CREATE POLICY "Public charts are viewable by everyone" ON compatibility_charts
    FOR SELECT USING (is_public = true);

-- 5. 要素テーブルのポリシー
-- 相性図の作成者のみ要素を管理可能
CREATE POLICY "Elements are viewable with chart access" ON elements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM compatibility_charts 
            WHERE id = chart_id 
            AND (is_public = true OR auth.uid() = user_id)
        )
    );

CREATE POLICY "Users can manage elements in own charts" ON elements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM compatibility_charts 
            WHERE id = chart_id 
            AND auth.uid() = user_id
        )
    );

-- 6. 比較項目テーブルのポリシー
-- 要素の作成者のみ比較項目を管理可能
CREATE POLICY "Element categories are viewable with element access" ON element_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM elements e
            JOIN compatibility_charts c ON e.chart_id = c.id
            WHERE e.id = element_id 
            AND (c.is_public = true OR c.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage element categories in own charts" ON element_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM elements e
            JOIN compatibility_charts c ON e.chart_id = c.id
            WHERE e.id = element_id 
            AND c.user_id = auth.uid()
        )
    );

-- 7. 相性テーブルのポリシー
-- 相性図の作成者のみ相性を管理可能
CREATE POLICY "Compatibilities are viewable with chart access" ON compatibilities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM compatibility_charts 
            WHERE id = (
                SELECT chart_id FROM elements WHERE id = left_element_id
            )
            AND (is_public = true OR auth.uid() = user_id)
        )
    );

CREATE POLICY "Users can manage compatibilities in own charts" ON compatibilities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM compatibility_charts 
            WHERE id = (
                SELECT chart_id FROM elements WHERE id = left_element_id
            )
            AND auth.uid() = user_id
        )
    );

-- 8. 相性スコアテーブルのポリシー
-- 相性スコアは誰でも閲覧可能
CREATE POLICY "Compatibility scores are viewable by everyone" ON compatibility_scores
    FOR SELECT USING (true);

-- 9. コメントテーブルのポリシー
-- 公開された相性図のコメントは誰でも閲覧可能
CREATE POLICY "Comments are viewable with chart access" ON comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM compatibility_charts 
            WHERE id = chart_id 
            AND (is_public = true OR auth.uid() = user_id)
        )
    );

-- ログインユーザーのみコメント投稿可能
CREATE POLICY "Authenticated users can insert comments on public charts" ON comments
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM compatibility_charts 
            WHERE id = chart_id 
            AND is_public = true
        )
    );

-- コメント投稿者は自分のコメントを編集・削除可能
CREATE POLICY "Users can update own comments" ON comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON comments
    FOR DELETE USING (auth.uid() = user_id);

-- 10. Goodテーブルのポリシー
-- Good情報は相性図へのアクセス権があるユーザーのみ閲覧可能
CREATE POLICY "Goods are viewable with chart access" ON goods
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM compatibility_charts 
            WHERE id = chart_id 
            AND (is_public = true OR auth.uid() = user_id)
        )
    );

-- ログインユーザーのみGood管理可能
CREATE POLICY "Authenticated users can manage own goods" ON goods
    FOR ALL USING (auth.uid() = user_id);

-- 11. ブックマークテーブルのポリシー
-- ブックマーク情報は相性図へのアクセス権があるユーザーのみ閲覧可能
CREATE POLICY "Bookmarks are viewable with chart access" ON bookmarks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM compatibility_charts 
            WHERE id = chart_id 
            AND (is_public = true OR auth.uid() = user_id)
        )
    );

-- ログインユーザーのみブックマーク管理可能
CREATE POLICY "Authenticated users can manage own bookmarks" ON bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- 注意事項:
-- 1. このファイルは、初期スキーマのマイグレーションが完了した後に実行してください
-- 2. RLSポリシーは、アプリケーションのセキュリティ要件に応じて調整してください
-- 3. 本番環境での適用前に、十分なテストを行ってください
-- 4. 必要に応じて、追加のセキュリティポリシーを設定してください
