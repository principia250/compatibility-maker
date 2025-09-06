-- usersテーブルのRLSポリシーを変更して公開

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "users_select_own_policy" ON users;
DROP POLICY IF EXISTS "users_update_own_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- 新しいポリシーを作成
-- 1. 読み取り: 誰でも可能（usernameなどの基本情報は公開）
CREATE POLICY "users_select_public_policy" ON users
    FOR SELECT USING (true);

-- 2. 更新: 自分のプロフィールのみ
CREATE POLICY "users_update_own_policy" ON users
    FOR UPDATE USING (
        users.auth_user_id = auth.uid()
    );

-- 3. 挿入・削除: 認証システムで管理（手動操作禁止）
CREATE POLICY "users_insert_policy" ON users
    FOR INSERT WITH CHECK (false);

CREATE POLICY "users_delete_policy" ON users
    FOR DELETE USING (false);
