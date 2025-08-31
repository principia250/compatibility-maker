-- Row Level Security（RLS）ポリシーの作成

-- 1. compatibility_chartsテーブルのRLS有効化とポリシー
ALTER TABLE compatibility_charts ENABLE ROW LEVEL SECURITY;

-- 作成者は自分の相性図を管理可能
CREATE POLICY "Users can view own charts" ON compatibility_charts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = compatibility_charts.user_id 
            AND users.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own charts" ON compatibility_charts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = compatibility_charts.user_id 
            AND users.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own charts" ON compatibility_charts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = compatibility_charts.user_id 
            AND users.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own charts" ON compatibility_charts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = compatibility_charts.user_id 
            AND users.auth_user_id = auth.uid()
        )
    );

-- 公開された相性図は誰でも閲覧可能
CREATE POLICY "Public charts are viewable by everyone" ON compatibility_charts
    FOR SELECT USING (is_public = true);

-- 2. element_categoriesテーブルのRLS有効化とポリシー
ALTER TABLE element_categories ENABLE ROW LEVEL SECURITY;

-- element_categories読み取りポリシー（公開チャートまたは所有者）
CREATE POLICY "element_categories_select_policy" ON element_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM compatibility_charts cc
            JOIN users u ON cc.user_id = u.id
            WHERE cc.id = element_categories.chart_id 
            AND (cc.is_public = true OR u.auth_user_id = auth.uid())
        )
    );

-- element_categories挿入ポリシー（チャート所有者のみ）
CREATE POLICY "element_categories_insert_policy" ON element_categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM compatibility_charts cc
            JOIN users u ON cc.user_id = u.id
            WHERE cc.id = element_categories.chart_id 
            AND u.auth_user_id = auth.uid()
        )
    );

-- element_categories更新ポリシー（チャート所有者のみ）
CREATE POLICY "element_categories_update_policy" ON element_categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM compatibility_charts cc
            JOIN users u ON cc.user_id = u.id
            WHERE cc.id = element_categories.chart_id 
            AND u.auth_user_id = auth.uid()
        )
    );

-- element_categories削除ポリシー（チャート所有者のみ）
CREATE POLICY "element_categories_delete_policy" ON element_categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM compatibility_charts cc
            JOIN users u ON cc.user_id = u.id
            WHERE cc.id = element_categories.chart_id 
            AND u.auth_user_id = auth.uid()
        )
    );

-- 3. elementsテーブルのRLS有効化とポリシー
ALTER TABLE elements ENABLE ROW LEVEL SECURITY;

-- elements読み取りポリシー（公開チャートまたは所有者）
CREATE POLICY "elements_select_policy" ON elements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM element_categories ec
            JOIN compatibility_charts cc ON ec.chart_id = cc.id
            JOIN users u ON cc.user_id = u.id
            WHERE ec.id = elements.element_category_id 
            AND (cc.is_public = true OR u.auth_user_id = auth.uid())
        )
    );

-- elements挿入ポリシー（チャート所有者のみ）
CREATE POLICY "elements_insert_policy" ON elements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM element_categories ec
            JOIN compatibility_charts cc ON ec.chart_id = cc.id
            JOIN users u ON cc.user_id = u.id
            WHERE ec.id = elements.element_category_id 
            AND u.auth_user_id = auth.uid()
        )
    );

-- elements更新ポリシー（チャート所有者のみ）
CREATE POLICY "elements_update_policy" ON elements
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM element_categories ec
            JOIN compatibility_charts cc ON ec.chart_id = cc.id
            JOIN users u ON cc.user_id = u.id
            WHERE ec.id = elements.element_category_id 
            AND u.auth_user_id = auth.uid()
        )
    );

-- elements削除ポリシー（チャート所有者のみ）
CREATE POLICY "elements_delete_policy" ON elements
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM element_categories ec
            JOIN compatibility_charts cc ON ec.chart_id = cc.id
            JOIN users u ON cc.user_id = u.id
            WHERE ec.id = elements.element_category_id 
            AND u.auth_user_id = auth.uid()
        )
    );

-- 4. compatibilitiesテーブルのRLS有効化とポリシー
ALTER TABLE compatibilities ENABLE ROW LEVEL SECURITY;

-- compatibilities読み取りポリシー（公開チャートまたは所有者）
CREATE POLICY "compatibilities_select_policy" ON compatibilities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM compatibility_charts cc
            JOIN users u ON cc.user_id = u.id
            WHERE cc.id = compatibilities.chart_id
            AND (cc.is_public = true OR u.auth_user_id = auth.uid())
        )
    );

-- compatibilities挿入ポリシー（チャート所有者のみ）
CREATE POLICY "compatibilities_insert_policy" ON compatibilities
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM compatibility_charts cc
            JOIN users u ON cc.user_id = u.id
            WHERE cc.id = compatibilities.chart_id
            AND u.auth_user_id = auth.uid()
        )
    );

-- compatibilities更新ポリシー（チャート所有者のみ）
CREATE POLICY "compatibilities_update_policy" ON compatibilities
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM compatibility_charts cc
            JOIN users u ON cc.user_id = u.id
            WHERE cc.id = compatibilities.chart_id
            AND u.auth_user_id = auth.uid()
        )
    );

-- compatibilities削除ポリシー（チャート所有者のみ）
CREATE POLICY "compatibilities_delete_policy" ON compatibilities
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM compatibility_charts cc
            JOIN users u ON cc.user_id = u.id
            WHERE cc.id = compatibilities.chart_id
            AND u.auth_user_id = auth.uid()
        )
    );

-- 5. commentsテーブルのRLS有効化とポリシー
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- comments読み取りポリシー（公開チャートまたは所有者）
CREATE POLICY "comments_select_policy" ON comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM compatibility_charts cc
            JOIN users u ON cc.user_id = u.id
            WHERE cc.id = comments.chart_id
            AND (cc.is_public = true OR u.auth_user_id = auth.uid())
        )
    );

-- comments挿入ポリシー（認証ユーザーのみ）
CREATE POLICY "comments_insert_policy" ON comments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = comments.user_id
            AND u.auth_user_id = auth.uid()
        )
    );

-- comments更新ポリシー（コメント作成者のみ）
CREATE POLICY "comments_update_policy" ON comments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = comments.user_id
            AND u.auth_user_id = auth.uid()
        )
    );

-- comments削除ポリシー（コメント作成者のみ）
CREATE POLICY "comments_delete_policy" ON comments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = comments.user_id
            AND u.auth_user_id = auth.uid()
        )
    );

-- 6. goodsテーブルのRLS有効化とポリシー
ALTER TABLE goods ENABLE ROW LEVEL SECURITY;

-- goods読み取りポリシー（所有者のみ）
CREATE POLICY "goods_select_policy" ON goods
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = goods.user_id
            AND u.auth_user_id = auth.uid()
        )
    );

-- goods挿入ポリシー（認証ユーザーのみ）
CREATE POLICY "goods_insert_policy" ON goods
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = goods.user_id
            AND u.auth_user_id = auth.uid()
        )
    );

-- goods更新ポリシー（所有者のみ）
CREATE POLICY "goods_update_policy" ON goods
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = goods.user_id
            AND u.auth_user_id = auth.uid()
        )
    );

-- goods削除ポリシー（所有者のみ）
CREATE POLICY "goods_delete_policy" ON goods
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = goods.user_id
            AND u.auth_user_id = auth.uid()
        )
    );

-- 7. bookmarksテーブルのRLS有効化とポリシー
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- bookmarks読み取りポリシー（所有者のみ）
CREATE POLICY "bookmarks_select_policy" ON bookmarks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = bookmarks.user_id
            AND u.auth_user_id = auth.uid()
        )
    );

-- bookmarks挿入ポリシー（認証ユーザーのみ）
CREATE POLICY "bookmarks_insert_policy" ON bookmarks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = bookmarks.user_id
            AND u.auth_user_id = auth.uid()
        )
    );

-- bookmarks更新ポリシー（所有者のみ）
CREATE POLICY "bookmarks_update_policy" ON bookmarks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = bookmarks.user_id
            AND u.auth_user_id = auth.uid()
        )
    );

-- bookmarks削除ポリシー（所有者のみ）
CREATE POLICY "bookmarks_delete_policy" ON bookmarks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = bookmarks.user_id
            AND u.auth_user_id = auth.uid()
        )
    );
