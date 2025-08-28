-- 新しいplan_idカラムを追加（一時的にNULL許可）
ALTER TABLE users 
ADD COLUMN plan_id UUID REFERENCES plans(id);

-- plan_idカラムにインデックスを作成
CREATE INDEX idx_users_plan_id ON users(plan_id);

-- plan_typeの値に基づいてplan_idを設定
UPDATE users 
SET plan_id = (
    SELECT id FROM plans 
    WHERE name = users.plan_type
    LIMIT 1
);

-- plan_idカラムをNOT NULLに変更
ALTER TABLE users 
ALTER COLUMN plan_id SET NOT NULL;

-- 古いplan_typeカラムのインデックスを削除
DROP INDEX IF EXISTS idx_users_plan_type;

-- 古いplan_typeカラムを削除
ALTER TABLE users 
DROP COLUMN plan_type;

-- ユーザープロファイル同期ファンクションを修正
-- 新規ユーザーにfreeプランを自動設定するように変更
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
