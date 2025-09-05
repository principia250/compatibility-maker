'use client';

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchCharts, SearchParams, SearchResponse } from '@/actions/composed/search/fetch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Search, 
    Calendar, 
    ThumbsUp, 
    ChevronLeft, 
    ChevronRight, 
    ArrowDownAz, 
    ArrowDownZa,
    User,
} from 'lucide-react';
import Link from 'next/link';

// キャッシュ用の型
interface CacheEntry {
    data: SearchResponse;
    timestamp: number;
}

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // 検索条件の状態
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [searchBy, setSearchBy] = useState<'title' | 'username'>('title');
    const [sortBy, setSortBy] = useState<'updatedAt' | 'goodCount'>('updatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    
    // 検索結果の状態
    const [searchData, setSearchData] = useState<SearchResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // キャッシュ
    const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());
    
    // キャッシュキーを生成
    const getCacheKey = useCallback((params: SearchParams) => {
        return `${params.query}-${params.sortBy}-${params.sortOrder}-${params.page}`;
    }, []);
    
    // 検索実行
    const performSearch = useCallback(async (params: SearchParams) => {
        const cacheKey = getCacheKey(params);
        const cached = cache.get(cacheKey);
        
        // キャッシュが存在し、5分以内の場合はキャッシュを使用
        if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
            setSearchData(cached.data);
            return;
        }
        
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await searchCharts(params);
            
            if (result.error) {
                setError(result.error.message);
                setSearchData(null);
            } else if (result.data) {
                setSearchData(result.data);
                // キャッシュに保存
                setCache(prev => new Map(prev).set(cacheKey, {
                    data: result.data!,
                    timestamp: Date.now()
                }));
            }
        } catch (err) {
            setError('検索中にエラーが発生しました');
            setSearchData(null);
        } finally {
            setIsLoading(false);
        }
    }, [cache, getCacheKey]);
    
    // URL更新関数
    const updateURL = () => {
        const newSearchParams = new URLSearchParams();
        if (query) newSearchParams.set('q', query);
        if (sortBy !== 'updatedAt') newSearchParams.set('sortBy', sortBy);
        if (sortOrder !== 'desc') newSearchParams.set('sortOrder', sortOrder);
        if (currentPage !== 1) newSearchParams.set('page', currentPage.toString());
        
        const newUrl = `/search${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`;
        router.replace(newUrl, { scroll: false });
    };
    
    // 検索実行
    const handleSearch = () => {
        setCurrentPage(1);
        const params: SearchParams = {
            query,
            searchBy,
            sortBy,
            sortOrder,
            page: 1,
            pageSize: 10
        };
        performSearch(params);
        updateURL();
    };
    
    // ページネーション
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        const params: SearchParams = {
            query,
            searchBy,
            sortBy,
            sortOrder,
            page,
            pageSize: 10
        };
        performSearch(params);
        updateURL();
    };
    
    // ソート変更
    const handleSortChange = (newSortBy: 'updatedAt' | 'goodCount', newSortOrder: 'asc' | 'desc') => {
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
        setCurrentPage(1);
    };
    
    // ページ番号の配列を生成
    const getPageNumbers = () => {
        if (!searchData) return [];
        
        const { currentPage, totalPages } = searchData;
        const pages: (number | string)[] = [];
        
        // 最初の2ページ
        for (let i = 1; i <= Math.min(2, totalPages); i++) {
            pages.push(i);
        }
        
        if (totalPages > 2) {
            // 現在のページの前後2ページ
            const start = Math.max(3, currentPage - 2);
            const end = Math.min(totalPages - 1, currentPage + 2);
            
            if (start > 3) {
                pages.push('...');
            }
            
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) {
                    pages.push(i);
                }
            }
            
            if (end < totalPages - 1) {
                pages.push('...');
            }
            
            // 最後の2ページ
            for (let i = Math.max(totalPages - 1, 1); i <= totalPages; i++) {
                if (!pages.includes(i)) {
                    pages.push(i);
                }
            }
        }
        
        return pages;
    };
    
    // 日付フォーマット
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}/${month}/${day} ${hours}:${minutes}`;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* 検索フォーム */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <Input
                            type="text"
                            placeholder="Enter search term..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full"
                        />
                    </div>
                    <Button onClick={handleSearch} disabled={isLoading}>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                    </Button>
                </div>
                
                {/* 検索方法選択 */}
                <div className="mb-4">
                    <RadioGroup
                        value={searchBy}
                        onValueChange={(value: 'title' | 'username') => setSearchBy(value)}
                        className="flex gap-6"
                    >
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="title" id="search-title" />
                            <label htmlFor="search-title" className="text-sm cursor-pointer">Search by Title</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="username" id="search-username" />
                            <label htmlFor="search-username" className="text-sm cursor-pointer">Search by Creator Name</label>
                        </div>
                    </RadioGroup>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex gap-2">
                        <Select value={sortBy} onValueChange={(value: 'updatedAt' | 'goodCount') => handleSortChange(value, sortOrder)}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="updatedAt">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-white" />
                                        Updated Date
                                    </div>
                                </SelectItem>
                                <SelectItem value="goodCount">
                                    <div className="flex items-center gap-2">
                                        <ThumbsUp className="w-4 h-4 text-white" />
                                        Good Count
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => handleSortChange(sortBy, value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="desc">
                                    <div className="flex items-center gap-2">
                                        <ArrowDownZa className="w-4 h-4 text-white" />
                                        Descending
                                    </div>
                                </SelectItem>
                                <SelectItem value="asc">
                                    <div className="flex items-center gap-2">
                                        <ArrowDownAz className="w-4 h-4 text-white" />
                                        Ascending
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            
            {/* 検索結果 */}
            {isLoading && (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                    <p className="mt-2">Searching...</p>
                </div>
            )}
            
            {error && (
                <div className="text-red-500 text-center py-8">
                    {error}
                </div>
            )}
            
            {searchData && !isLoading && (
                <>
                    {/* 結果件数 */}
                    <div className="mb-4">
                        <p className="text-gray-400">
                            {searchData.totalCount} results
                        </p>
                    </div>
                    
                    {/* 検索結果一覧 */}
                    {searchData.results.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-xl text-gray-400">No results.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 mb-8">
                            {searchData.results.map((chart) => (
                                <Link
                                    key={chart.id}
                                    href={`/chart/${chart.id}`}
                                    className="block"
                                >
                                    <div className="border border-white rounded-xl p-4 hover:text-primary">
                                        {/* タイトル */}
                                        <div className="text-lg font-bold">{chart.title}</div>
                                        {/* その他 */}
                                        <div className="flex flex-col sm:flex-row sm:justify-between">
                                            {/* 作成者 */}
                                            <div className="text-sm text-gray-400">
                                                Created by {chart.user.username}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    {/* グッド数 */}
                                                    <ThumbsUp className="w-4 h-4" />
                                                    {chart.goodCount}
                                                </div>
                                                {/* 更新日 */}
                                                {formatDate(chart.updatedAt)}
                                            </div>
                                        </div>
                                    </div>
                                    {/* <Card className="hover:bg-gray-800 transition-colors cursor-pointer">
                                        <CardHeader className="">
                                            <CardTitle className="">
                                                {chart.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0 bg-red-500">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                    <span>Created by <span className="text-white">{chart.user.username}</span></span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <ThumbsUp className="w-4 h-4" />
                                                        {chart.goodCount}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(chart.updatedAt)}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card> */}
                                </Link>
                            ))}
                        </div>
                    )}
                    
                    {/* ページネーション */}
                    {searchData.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            
                            {getPageNumbers().map((page, index) => (
                                <div key={index}>
                                    {page === '...' ? (
                                        <span className="px-3 py-2 text-gray-400">...</span>
                                    ) : (
                                        <Button
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(page as number)}
                                            className="min-w-[40px]"
                                        >
                                            {page}
                                        </Button>
                                    )}
                                </div>
                            ))}
                            
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === searchData.totalPages}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
