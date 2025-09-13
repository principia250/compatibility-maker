'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useError } from '@/hooks/use-error';
import {
  searchCharts,
  SearchParams,
  SearchResponse,
} from '@/actions/composed/search/fetch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Search,
  Calendar,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  ArrowDownAz,
  ArrowDownZa,
} from 'lucide-react';
import Link from 'next/link';
import Loading from '@/components/loading';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addError } = useError();

  // 検索条件の状態
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [searchBy, setSearchBy] = useState<'title' | 'username'>(
    (searchParams.get('searchBy') as 'title' | 'username') || 'title'
  );
  const [sortBy, setSortBy] = useState<'updatedAt' | 'goodCount'>(
    (searchParams.get('sortBy') as 'updatedAt' | 'goodCount') || 'updatedAt'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1')
  );

  // 検索結果の状態
  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageInput, setPageInput] = useState(currentPage.toString());

  // 初期表示時にクエリパラメータに基づいて検索実行
  useEffect(() => {
    const performInitialSearch = async () => {
      // クエリパラメータに検索条件がある場合のみ検索実行
      if (query || searchParams.get('q')) {
        setIsLoading(true);

        try {
          const params: SearchParams = {
            query: query || searchParams.get('q') || '',
            searchBy,
            sortBy,
            sortOrder,
            page: currentPage,
            pageSize: 10,
          };

          const result = await searchCharts(params);

          if (result.error) {
            addError(result.error.message);
            setSearchData(null);
          } else if (result.data) {
            setSearchData(result.data);
          }
        } catch {
          addError('Search error occurred');
          setSearchData(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    performInitialSearch();
  }, []); // 初回のみ実行

  // URL更新関数
  const updateURL = () => {
    const newSearchParams = new URLSearchParams();
    if (query) newSearchParams.set('q', query);
    if (searchBy !== 'title') newSearchParams.set('searchBy', searchBy);
    if (sortBy !== 'updatedAt') newSearchParams.set('sortBy', sortBy);
    if (sortOrder !== 'desc') newSearchParams.set('sortOrder', sortOrder);
    if (currentPage !== 1) newSearchParams.set('page', currentPage.toString());

    const newUrl = `/search${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`;
    router.replace(newUrl, { scroll: false });
  };

  // 検索実行
  const handleSearch = async () => {
    setCurrentPage(1); // 検索時は1ページ目に戻す
    setPageInput('1'); // 入力ボックスも1にリセット
    setIsLoading(true);

    try {
      const params: SearchParams = {
        query,
        searchBy,
        sortBy,
        sortOrder,
        page: 1,
        pageSize: 10,
      };

      const result = await searchCharts(params);

      if (result.error) {
        addError(result.error.message);
        setSearchData(null);
      } else if (result.data) {
        setSearchData(result.data);
      }
    } catch {
      addError('Search error occurred');
      setSearchData(null);
    } finally {
      setIsLoading(false);
    }

    // URLを更新
    updateURL();
  };

  // ページネーション
  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    setPageInput(page.toString());

    // 検索を実行
    setIsLoading(true);

    try {
      const params: SearchParams = {
        query,
        searchBy,
        sortBy,
        sortOrder,
        page,
        pageSize: 10,
      };

      const result = await searchCharts(params);

      if (result.error) {
        addError(result.error.message);
        setSearchData(null);
      } else if (result.data) {
        setSearchData(result.data);
      }
    } catch {
      addError('Search error occurred');
      setSearchData(null);
    } finally {
      setIsLoading(false);
    }

    // URLを更新（新しいページ番号を使用）
    const newSearchParams = new URLSearchParams();
    if (query) newSearchParams.set('q', query);
    if (searchBy !== 'title') newSearchParams.set('searchBy', searchBy);
    if (sortBy !== 'updatedAt') newSearchParams.set('sortBy', sortBy);
    if (sortOrder !== 'desc') newSearchParams.set('sortOrder', sortOrder);
    if (page !== 1) newSearchParams.set('page', page.toString());

    const newUrl = `/search${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`;
    router.replace(newUrl, { scroll: false });
  };

  // ページ入力の処理
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNumber = parseInt(pageInput);

    if (searchData && pageNumber >= 1 && pageNumber <= searchData.totalPages) {
      handlePageChange(pageNumber);
    } else {
      // 無効なページ番号の場合は現在のページに戻す
      setPageInput(currentPage.toString());
    }
  };

  // ソート変更
  const handleSortChange = (
    newSortBy: 'updatedAt' | 'goodCount',
    newSortOrder: 'asc' | 'desc'
  ) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
    setPageInput('1');
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
      <h1 className="text-2xl font-bold mb-6">Search Charts</h1>

      {/* 検索フォーム */}
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
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
              <label htmlFor="search-title" className="text-sm cursor-pointer">
                Search by Title
              </label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="username" id="search-username" />
              <label
                htmlFor="search-username"
                className="text-sm cursor-pointer"
              >
                Search by Creator Name
              </label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <Select
              value={sortBy}
              onValueChange={(value: 'updatedAt' | 'goodCount') =>
                handleSortChange(value, sortOrder)
              }
            >
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

            <Select
              value={sortOrder}
              onValueChange={(value: 'asc' | 'desc') =>
                handleSortChange(sortBy, value)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">
                  <div className="flex items-center gap-2">
                    <ArrowDownAz className="w-4 h-4 text-white" />
                    Ascending
                  </div>
                </SelectItem>
                <SelectItem value="desc">
                  <div className="flex items-center gap-2">
                    <ArrowDownZa className="w-4 h-4 text-white" />
                    Descending
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 検索結果 */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-lg">Loading...</div>
        </div>
      ) : searchData ? (
        <div>
          {/* 結果数表示 */}
          <div className="mb-4 text-sm text-gray-400">
            {searchData.totalCount} results found
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
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <form
                onSubmit={handlePageInputSubmit}
                className="flex items-center gap-2"
              >
                <span className="text-sm">Page</span>
                <Input
                  type="number"
                  min="1"
                  max={searchData.totalPages}
                  value={pageInput}
                  onChange={handlePageInputChange}
                  className="w-16 h-8 text-center"
                  disabled={isLoading}
                />
                <span className="text-sm">of {searchData.totalPages}</span>
              </form>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === searchData.totalPages || isLoading}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-400">
            Enter a search term to find charts.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SearchContent />
    </Suspense>
  );
}
