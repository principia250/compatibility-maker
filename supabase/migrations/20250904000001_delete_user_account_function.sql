-- アカウント削除用のPostgreSQL関数を作成
CREATE OR REPLACE FUNCTION delete_user_account(auth_user_id UUID)
RETURNS VOID AS $$
DECLARE
  user_record_id UUID;
BEGIN
  -- まず、auth_user_idからusers.idを取得
  SELECT id INTO user_record_id FROM users WHERE auth_user_id = $1;
  
  -- ユーザーが存在しない場合はエラー
  IF user_record_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- トランザクション内で全ての削除処理を実行
  -- 1. ユーザーのcompatibility_chartsを削除（関連するcompatibilities、comments、goods、bookmarksも自動削除）
  DELETE FROM compatibility_charts WHERE user_id = user_record_id;
  
  -- 2. ユーザーのブックマークを削除
  DELETE FROM bookmarks WHERE user_id = user_record_id;
  
  -- 3. ユーザーのコメントを削除
  DELETE FROM comments WHERE user_id = user_record_id;
  
  -- 4. ユーザーのgoodsを削除
  DELETE FROM goods WHERE user_id = user_record_id;
  
  -- 5. usersテーブルからユーザーを削除
  DELETE FROM users WHERE auth_user_id = $1;
  
  -- 6. Supabase Authからユーザーを削除（これはクライアント側で実行）
  -- 注意: supabase.auth.admin.deleteUser()はクライアント側で実行する必要がある
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 関数の実行権限を設定
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;
