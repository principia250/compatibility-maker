-- ユーザープロファイル同期のためのファンクションとトリガー
-- このマイグレーションは、Supabase Authでユーザーが作成された際に
-- 自動的にpublic.usersテーブルにレコードを挿入する機能を提供します

-- 1. ユーザープロファイル同期ファンクションの作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- public.usersテーブルに新しいユーザーレコードを挿入
  INSERT INTO public.users (
    auth_user_id,
    username,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,                                    -- Supabase AuthのユーザーID
    NEW.raw_user_meta_data->>'username', -- ユーザー名（メタデータから取得、なければメールの@前部分）
    NOW(),                                     -- 作成日時
    NOW()                                      -- 更新日時
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. トリガーの作成
-- auth.usersテーブルにINSERTが発生した際にhandle_new_userファンクションを実行
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. ファンクションとトリガーの権限設定
-- ファンクションの実行権限を適切に設定
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
