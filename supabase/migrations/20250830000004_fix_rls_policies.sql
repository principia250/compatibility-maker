-- 不足しているRLSポリシーの追加

-- 1. plansテーブルのRLS有効化とポリシー
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- plansは誰でも読み取り可能（プラン情報は公開）
CREATE POLICY "plans_select_policy" ON plans
    FOR SELECT USING (true);

-- plansの挿入・更新・削除は管理者のみ（通常は操作しない）
CREATE POLICY "plans_admin_policy" ON plans
    FOR ALL USING (false);

-- 2. usersテーブルのRLS有効化とポリシー
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のプロフィールのみ読み取り可能
CREATE POLICY "users_select_own_policy" ON users
    FOR SELECT USING (
        users.auth_user_id = auth.uid()
    );

-- ユーザーは自分のプロフィールのみ更新可能
CREATE POLICY "users_update_own_policy" ON users
    FOR UPDATE USING (
        users.auth_user_id = auth.uid()
    );

-- ユーザーの挿入・削除は認証システムで管理
CREATE POLICY "users_insert_policy" ON users
    FOR INSERT WITH CHECK (false);

CREATE POLICY "users_delete_policy" ON users
    FOR DELETE USING (false);

-- 3. compatibility_scoresテーブルのRLS有効化とポリシー
ALTER TABLE compatibility_scores ENABLE ROW LEVEL SECURITY;

-- compatibility_scoresは誰でも読み取り可能（相性スコア情報は公開）
CREATE POLICY "compatibility_scores_select_policy" ON compatibility_scores
    FOR SELECT USING (true);

-- compatibility_scoresの挿入・更新・削除は管理者のみ（通常は操作しない）
CREATE POLICY "compatibility_scores_admin_policy" ON compatibility_scores
    FOR ALL USING (false);
