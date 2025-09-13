'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { useError } from '@/hooks/use-error';
import Loading from '@/components/loading';
import { useParams } from 'next/navigation';
import { COMMENT_MAX_LENGTH } from '@/constants/input-length';
import {
  fetchChartDetailData,
  ChartDetailData,
} from '@/actions/composed/chart-detail/fetch';
import {
  addComment,
  toggleBookmark,
  toggleGood,
  copyChart,
} from '@/actions/composed/chart-detail/mutation';
import CustomLink from '@/components/CustomLink';
import { ExplanatoryNote } from '@/components/NodeAndEdge/ExplanatoryNote';
import NodeAndEdge from '@/components/NodeAndEdge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bookmark, ThumbsUp, Copy } from 'lucide-react';
import { clsx } from 'clsx';
import { CommentCard } from '@/components/ui/comment-card';
import { useTranslation } from '@/lib/i18n';

export default function ChartDetailPage() {
  const { t } = useTranslation();
  const { user, isLoading, isAuthenticated } = useUser();
  const { addError } = useError();
  const params = useParams<{ id: string }>();
  const chartId = params?.id;
  const [data, setData] = useState<ChartDetailData | null>(null);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // 楽観的更新用の状態
  const [optimisticBookmark, setOptimisticBookmark] = useState<boolean | null>(
    null
  );
  const [optimisticGood, setOptimisticGood] = useState<boolean | null>(null);
  const [isCopying, setIsCopying] = useState<boolean>(false);

  useEffect(() => {
    const fetch = async () => {
      if (!chartId) {
        return;
      }
      // 未ログインユーザーでもチャートデータを取得
      const { data: data, error: error } = await fetchChartDetailData({
        loginUserId: user?.id,
        chartId: chartId,
      });
      if (error) {
        addError(error.message);
        return;
      }
      setData(data);
    };
    // ユーザー認証のローディングが完了してから実行
    if (!isLoading) {
      fetch();
    }
  }, [user, chartId, isLoading]); // addErrorを依存配列から削除

  const handleSubmitComment = async () => {
    if (!comment.trim() || !user?.id || !chartId) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await addComment({
        chartId: chartId,
        userId: user.id,
        content: comment.trim(),
      });

      if (error) {
        addError(error.message);
        return;
      }

      // コメント投稿成功
      setComment(''); // 入力フィールドをクリア

      // データを再取得してコメント一覧を更新
      if (user?.id && chartId) {
        const { data: updatedData, error: fetchError } =
          await fetchChartDetailData({
            loginUserId: user.id,
            chartId: chartId,
          });
        if (!fetchError && updatedData) {
          setData(updatedData);
        }
      }
    } catch {
      addError('Unexpected error occurred while submitting comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!user?.id || !chartId) {
      return;
    }

    // 楽観的更新: 即座にUIを更新
    const currentBookmarkState = data?.bookmark ? true : false;
    const newBookmarkState = !currentBookmarkState;
    setOptimisticBookmark(newBookmarkState);

    try {
      const { error } = await toggleBookmark({
        chartId: chartId,
        userId: user.id,
      });

      if (error) {
        addError(error.message);
        // エラーの場合、楽観的更新を元に戻す
        setOptimisticBookmark(null);
        return;
      }

      // 成功の場合、楽観的更新を確定
      setOptimisticBookmark(null);

      // データを再取得してブックマーク状態を更新
      if (user?.id && chartId) {
        const { data: updatedData, error: fetchError } =
          await fetchChartDetailData({
            loginUserId: user.id,
            chartId: chartId,
          });
        if (!fetchError && updatedData) {
          setData(updatedData);
        }
      }
    } catch {
      addError('Unexpected error occurred while toggling bookmark');
      // エラーの場合、楽観的更新を元に戻す
      setOptimisticBookmark(null);
    }
  };

  const handleToggleGood = async () => {
    if (!user?.id || !chartId) {
      return;
    }

    // 楽観的更新: 即座にUIを更新
    const currentGoodState = data?.good ? true : false;
    const newGoodState = !currentGoodState;
    setOptimisticGood(newGoodState);

    try {
      const { error } = await toggleGood({
        chartId: chartId,
        userId: user.id,
      });

      if (error) {
        addError(error.message);
        // エラーの場合、楽観的更新を元に戻す
        setOptimisticGood(null);
        return;
      }

      // 成功の場合、楽観的更新を確定
      setOptimisticGood(null);

      // データを再取得してグッド状態を更新
      if (user?.id && chartId) {
        const { data: updatedData, error: fetchError } =
          await fetchChartDetailData({
            loginUserId: user.id,
            chartId: chartId,
          });
        if (!fetchError && updatedData) {
          setData(updatedData);
        }
      }
    } catch {
      addError('Unexpected error occurred while toggling good');
      // エラーの場合、楽観的更新を元に戻す
      setOptimisticGood(null);
    }
  };

  const handleCopyChart = async () => {
    if (!user?.id || !chartId || !data?.canCopy) {
      return;
    }

    setIsCopying(true);
    try {
      const result = await copyChart({
        sourceChartId: chartId,
        targetUserId: user.id,
      });

      if (result.data?.chartId) {
        // コピー成功時は編集画面に遷移
        window.location.href = `/chart/${result.data.chartId}/edit`;
      } else {
        addError(result.error?.message || 'Failed to copy chart');
      }
    } catch {
      addError('Unexpected error occurred while copying chart');
    } finally {
      setIsCopying(false);
    }
  };

  if (isLoading || !data) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-4 overflow-x-hidden">
      {/* タイトル・ユーザー */}
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-bold">{data.title}</div>
        <div className="text-sm">by {data.user.username}</div>
        <div className="text-sm">
          {data.isPublic || t('この図は非公開です。', 'This chart is private.')}
        </div>
      </div>
      {/* 図の見方 */}
      <div className="w-full flex justify-end">
        <CustomLink href="/how-to-use">
          {t('この図の見方', 'How to read this chart?')}
        </CustomLink>
      </div>
      {/* 凡例 */}
      <ExplanatoryNote />
      {/* 図 */}
      <NodeAndEdge
        leftElements={data.leftCategory.elements.map((element) => ({
          id: element.id,
          text: element.name,
          displayScore: true,
          canHide: true,
        }))}
        rightElements={data.rightCategory.elements.map((element) => ({
          id: element.id,
          text: element.name,
          displayScore: true,
          canHide: true,
        }))}
        compatibilities={data.compatibilities}
        leftCanHide={true}
        rightCanHide={true}
        leftDisplayScore={true}
        rightDisplayScore={true}
        isEditing={false}
        leftCategoryName={data.leftCategory.name}
        rightCategoryName={data.rightCategory.name}
      />
      {/* コピーボタン */}
      {isAuthenticated && (
        <div className="flex flex-row justify-end">
          {data.canCopy ? (
            <Button
              onClick={handleCopyChart}
              disabled={isCopying}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {isCopying
                ? t('複製中...', 'Copying...')
                : t('この図を複製', 'Copy this chart')}
            </Button>
          ) : (
            <div className="text-sm text-gray-400">
              {t('この図は複製できません。', 'This chart cannot be copied')}
            </div>
          )}
        </div>
      )}

      {/* ブックマークとグッド */}
      <div className="flex flex-row justify-end gap-4">
        {isAuthenticated ? (
          <>
            <Bookmark
              className={clsx(
                'w-9 h-9 cursor-pointer transition-colors',
                optimisticBookmark !== null
                  ? optimisticBookmark
                    ? 'text-sky-600'
                    : 'text-white'
                  : data.bookmark
                    ? 'text-sky-600'
                    : 'text-white'
              )}
              onClick={handleToggleBookmark}
            />
            <ThumbsUp
              className={clsx(
                'w-8 h-8 cursor-pointer transition-colors',
                optimisticGood !== null
                  ? optimisticGood
                    ? 'text-yellow-300'
                    : 'text-white'
                  : data.good
                    ? 'text-yellow-300'
                    : 'text-white'
              )}
              onClick={handleToggleGood}
            />
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>{t('', 'Please')}</span>
            <CustomLink
              href="/auth/login"
              className="text-primary hover:text-primary/80 underline"
            >
              {t('ログイン', 'log in')}
            </CustomLink>
            <span>
              {t('してブックマーク', 'to bookmark or like this chart')}
            </span>
          </div>
        )}
      </div>
      {/* コメント */}
      <div className="flex flex-col gap-4">
        {/* セパレータ */}
        <div className="text-lg font-bold border-b border-white">Comments</div>

        {isAuthenticated ? (
          <>
            {/* 投稿フォーム */}
            <Input
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={COMMENT_MAX_LENGTH}
            />
            {comment.length > 0 && (
              <div className="flex justify-end">
                <Button onClick={handleSubmitComment} disabled={isSubmitting}>
                  {isSubmitting ? 'Posting...' : 'Comment'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
            <span>{t('', 'Please')}</span>
            <CustomLink
              href="/auth/login"
              className="text-primary hover:text-primary/80 underline"
            >
              {t('ログイン', 'log in')}
            </CustomLink>
            <span>{t('してコメントを投稿', 'to post a comment')}</span>
          </div>
        )}

        {/* コメント一覧 */}
        {data.comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment.content}
            userName={comment.user.username}
            createdAt={comment.createdAt}
          />
        ))}

        {/* コメントページへのリンク */}
        <div className="flex justify-end">
          <CustomLink href={`/chart/${chartId}/comments`}>
            Comments Page →
          </CustomLink>
        </div>
      </div>
    </div>
  );
}
