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
            console.error('User data fetch error:', error);
            return {
                data: null,
                error: {
                    message: 'Failed to fetch user data'
                }
            };
        }

        if (!userData) {
            return {
                data: null,
                error: {
                    message: 'User not found'
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
        console.error('Unexpected error in fetchUserData:', err);
        return {
            data: null,
            error: {
                message: 'Unexpected error occurred'
            }
        };
    }
}