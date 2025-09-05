'use server';

import { createClient } from "@/lib/supabase/server";
import { Response } from "@/actions/types/response";

export interface SearchResult {
    id: string;
    title: string;
    updatedAt: string;
    goodCount: number;
    user: {
        id: string;
        username: string;
    };
}

export interface SearchParams {
    query: string;
    searchBy: 'title' | 'username';
    sortBy: 'updatedAt' | 'goodCount';
    sortOrder: 'asc' | 'desc';
    page: number;
    pageSize: number;
}

export interface SearchResponse {
    results: SearchResult[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}

export const searchCharts = async (params: SearchParams): Promise<Response<SearchResponse>> => {
    try {
        const supabase = await createClient();

        const { query, searchBy, sortBy, sortOrder, page, pageSize } = params;
        const offset = (page - 1) * pageSize;

        // 検索クエリの構築
        let searchQuery = supabase
            .from('compatibility_charts')
            .select(`
                id,
                title,
                updated_at,
                created_at,
                user_id,
                users!inner (
                    id,
                    username
                ),
                goods!goods_chart_id_fkey (id)
            `)
            .eq('is_public', true);

        // キーワード検索（タイトルまたはユーザー名）
        if (query.trim()) {
            const keywords = query.trim().split(/\s+/).filter(keyword => keyword.length > 0);
            
            if (keywords.length > 0) {
                // 複数キーワードのAND検索
                for (const keyword of keywords) {
                    if (searchBy === 'title') {
                        searchQuery = searchQuery.ilike('title', `%${keyword}%`);
                    } else if (searchBy === 'username') {
                        searchQuery = searchQuery.ilike('users.username', `%${keyword}%`);
                    }
                }
            }
        }

        // 並び替え
        if (sortBy === 'updatedAt') {
            searchQuery = searchQuery.order('updated_at', { ascending: sortOrder === 'asc' });
        } else if (sortBy === 'goodCount') {
            // Good数での並び替えは後で処理
            searchQuery = searchQuery.order('updated_at', { ascending: false });
        }

        // データ取得
        const { data: charts, error: chartsError } = await searchQuery;

        if (chartsError) {
            console.error('Search charts error:', chartsError);
            return { data: null, error: { message: 'Failed to search charts' } };
        }


        if (!charts) {
            return {
                data: {
                    results: [],
                    totalCount: 0,
                    totalPages: 0,
                    currentPage: page
                },
                error: null
            };
        }

        // Good数をカウントして結果を整形
        const results: SearchResult[] = charts.map(chart => ({
            id: chart.id,
            title: chart.title,
            updatedAt: chart.updated_at || chart.created_at || new Date().toISOString(),
            goodCount: chart.goods?.length || 0,
            user: {
                id: chart.users?.id || '',
                username: chart.users?.username || 'Unknown'
            }
        }));

        // Good数での並び替え（必要に応じて）
        if (sortBy === 'goodCount') {
            results.sort((a, b) => {
                const diff = a.goodCount - b.goodCount;
                return sortOrder === 'asc' ? diff : -diff;
            });
        }

        // ページネーション
        const totalCount = results.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        const paginatedResults = results.slice(offset, offset + pageSize);

        return {
            data: {
                results: paginatedResults,
                totalCount,
                totalPages,
                currentPage: page
            },
            error: null
        };

    } catch (error) {
        console.error('Search charts error:', error);
        return { data: null, error: { message: 'An unexpected error occurred' } };
    }
};
