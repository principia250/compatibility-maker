'use server'

import { createClient } from "@/lib/supabase/server";
import { Response } from "@/actions/types/response";

export interface FetchUserData {
    id: string;
}

export interface UserDate {
    id: string;
    username: string;
}


export const fetchUserData = async (props: FetchUserData): Promise<Response<UserDate>> => {
    const supabase = await createClient();
    
    try {
        // public.usersテーブルからユーザー情報を取得
        const { data: userData, error } = await supabase
            .from('users')
            .select('id, username')
            .eq('auth_user_id', props.id)
            .single();

        if (error) {
            return {
                data: null,
                error: {
                    message: 'ユーザー情報の取得に失敗しました'
                }
            };
        }

        if (!userData) {
            return {
                data: null,
                error: {
                    message: 'ユーザーが見つかりません'
                }
            };
        }

        return {
            data: {
                id: userData.id || '',
                username: userData.username || ''
            },
            error: null
        };
        
    } catch (err) {
        return {
            data: null,
            error: {
                message: '予期しないエラーが発生しました'
            }
        };
    }
}