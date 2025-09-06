-- goodsテーブルのRLSポリシーを修正（検索画面でグッド数を表示するため）

-- 既存のgoods_select_policyを削除
DROP POLICY IF EXISTS "goods_select_policy" ON goods;

-- 新しいgoods_select_policyを作成（公開チャートのグッドは誰でも読み取り可能）
CREATE POLICY "goods_select_policy" ON goods
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM compatibility_charts cc
            WHERE cc.id = goods.chart_id
            AND cc.is_public = true
        )
    );

-- 所有者のグッドも読み取り可能にする
CREATE POLICY "goods_select_own_policy" ON goods
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = goods.user_id
            AND u.auth_user_id = auth.uid()
        )
    );
