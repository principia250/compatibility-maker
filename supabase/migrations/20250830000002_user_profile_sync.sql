-- ユーザープロファイル同期のためのファンクションとトリガー

-- 1. ユーザープロファイル同期ファンクションの作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    free_plan_id UUID;
BEGIN
  -- freeプランのIDを取得
  SELECT id INTO free_plan_id 
  FROM public.plans 
  WHERE name = 'free' 
  LIMIT 1;
  
  -- public.usersテーブルに新しいユーザーレコードを挿入
  INSERT INTO public.users (
    auth_user_id,
    username,
    plan_id,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,                                        -- Supabase AuthのユーザーID
    COALESCE(
      NEW.raw_user_meta_data->>'username', 
      split_part(NEW.email, '@', 1)
    ),                                             -- ユーザー名（メタデータから取得、なければメールの@前部分）
    COALESCE(free_plan_id, (SELECT id FROM public.plans LIMIT 1)), -- freeプランID（見つからない場合は最初のプラン）
    NOW(),                                         -- 作成日時
    NOW()                                          -- 更新日時
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
