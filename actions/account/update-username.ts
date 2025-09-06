'use server';

import { createClient } from '@/lib/supabase/server';
import { Response } from '@/actions/types/response';

interface UpdateUsernameParams {
  username: string;
}

export async function updateUsername({
  username,
}: UpdateUsernameParams): Promise<Response<void>> {
  try {
    const supabase = await createClient();

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: { message: 'Need authentication' } };
    }

    // ユーザー名の重複チェック
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .neq('auth_user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116は「データが見つからない」エラー
      return { data: null, error: { message: 'Error checking username' } };
    }

    if (existingUser) {
      return { data: null, error: { message: 'Username already exists' } };
    }

    // ユーザー名を更新
    const { error: updateError } = await supabase
      .from('users')
      .update({ username })
      .eq('auth_user_id', user.id);

    if (updateError) {
      return { data: null, error: { message: 'Failed to update username' } };
    }

    return { data: undefined, error: null };
  } catch (error) {
    console.error('updateUsername error:', error);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
}
