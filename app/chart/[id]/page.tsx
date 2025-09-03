"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import Loading from "@/components/loading";
import { useParams } from "next/navigation";
import { fetchChartDetailData, ChartDetailData } from "@/actions/composed/chart-detail/fetch";
import { addComment, toggleBookmark, toggleGood } from "@/actions/composed/chart-detail/mutation";
import Link from "next/link";
import { ExplanatoryNote } from "@/components/NodeAndEdge/ExplanatoryNote";
import NodeAndEdge from "@/components/NodeAndEdge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bookmark, ThumbsUp } from "lucide-react";
import { clsx } from "clsx";
import { CommentCard } from "@/components/ui/comment-card";

export default function ChartDetailPage() {
    const [isLoadingState, setIsLoadingState] = useState<boolean>(true)
    const { user, isLoading, isAuthenticated, username, fetchUser, logout } = useUser();
    const params = useParams<{ id: string }>();
    const chartId = params?.id;
    const [data, setData] = useState<ChartDetailData | null>(null)
    const [comment, setComment] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [isBookmarking, setIsBookmarking] = useState<boolean>(false)
    const [isGooding, setIsGooding] = useState<boolean>(false)
    // 楽観的更新用の状態
    const [optimisticBookmark, setOptimisticBookmark] = useState<boolean | null>(null)
    const [optimisticGood, setOptimisticGood] = useState<boolean | null>(null)

    useEffect(() => {
        if(isLoading || user) {
            setIsLoadingState(false)
        }
    },[isLoading])

    useEffect(() => {
        const fetch = async () => {
            if (user?.id === null || user?.id === undefined || user?.id === '') {
                return
            }
            if (!chartId) {
                return
            }
            const { data: data, error: error } = await fetchChartDetailData({ loginUserId: user.id, chartId: chartId})
            if (error) {
                throw error
            }
            setData(data)
        }
        fetch()
    },[user, chartId])

    const handleSubmitComment = async () => {
        if (!comment.trim() || !user?.id || !chartId) {
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: newComment, error } = await addComment({
                chartId: chartId,
                userId: user.id,
                content: comment.trim()
            });

            if (error) {
                console.error('Comment submission error:', error);
                // エラーハンドリング（必要に応じてトースト表示など）
                return;
            }

            // コメント投稿成功
            setComment(""); // 入力フィールドをクリア
            
            // データを再取得してコメント一覧を更新
            if (user?.id && chartId) {
                const { data: updatedData, error: fetchError } = await fetchChartDetailData({ 
                    loginUserId: user.id, 
                    chartId: chartId 
                });
                if (!fetchError && updatedData) {
                    setData(updatedData);
                }
            }
        } catch (error) {
            console.error('Unexpected error:', error);
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

        setIsBookmarking(true);
        try {
            const { data: result, error } = await toggleBookmark({
                chartId: chartId,
                userId: user.id
            });

            if (error) {
                console.error('Bookmark toggle error:', error);
                // エラーの場合、楽観的更新を元に戻す
                setOptimisticBookmark(null);
                return;
            }

            // 成功の場合、楽観的更新を確定
            setOptimisticBookmark(null);
            
            // データを再取得してブックマーク状態を更新
            if (user?.id && chartId) {
                const { data: updatedData, error: fetchError } = await fetchChartDetailData({ 
                    loginUserId: user.id, 
                    chartId: chartId 
                });
                if (!fetchError && updatedData) {
                    setData(updatedData);
                }
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            // エラーの場合、楽観的更新を元に戻す
            setOptimisticBookmark(null);
        } finally {
            setIsBookmarking(false);
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

        setIsGooding(true);
        try {
            const { data: result, error } = await toggleGood({
                chartId: chartId,
                userId: user.id
            });

            if (error) {
                console.error('Good toggle error:', error);
                // エラーの場合、楽観的更新を元に戻す
                setOptimisticGood(null);
                return;
            }

            // 成功の場合、楽観的更新を確定
            setOptimisticGood(null);
            
            // データを再取得してグッド状態を更新
            if (user?.id && chartId) {
                const { data: updatedData, error: fetchError } = await fetchChartDetailData({ 
                    loginUserId: user.id, 
                    chartId: chartId 
                });
                if (!fetchError && updatedData) {
                    setData(updatedData);
                }
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            // エラーの場合、楽観的更新を元に戻す
            setOptimisticGood(null);
        } finally {
            setIsGooding(false);
        }
    };

    if(isLoading || isLoadingState || !data) {
        return <Loading />
    }


    return (<div className="flex flex-col gap-4">
        {/* タイトル・ユーザー */}
        <div className="flex flex-col gap-2">
            <div className="text-2xl font-bold">{data.title}</div>
            <div className="text-sm">by {data.user.username}</div>
            <div className="text-sm">{data.isPublic || "This chart is private."}</div>
        </div>
        {/* 図の見方 */}
        <div className="w-full flex justify-end">
            <Link href="/how-to-use" className="hover:text-primary">
                How to read this chart?
            </Link>
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
        {/* ブックマークとグッド */}
        <div className="flex flex-row justify-end gap-4">
            <Bookmark 
                className={clsx(
                    "w-9 h-9 cursor-pointer transition-colors", 
                    optimisticBookmark !== null 
                        ? (optimisticBookmark ? "text-sky-600" : "text-white")
                        : (data.bookmark ? "text-sky-600" : "text-white")
                )}
                onClick={handleToggleBookmark}
            />
            <ThumbsUp 
                className={clsx(
                    "w-8 h-8 cursor-pointer transition-colors", 
                    optimisticGood !== null 
                        ? (optimisticGood ? "text-yellow-300" : "text-white")
                        : (data.good ? "text-yellow-300" : "text-white")
                )}
                onClick={handleToggleGood}
            />
        </div>
        {/* コメント */}
        <div className="flex flex-col gap-4">
            {/* セパレータ */}
            <div className="text-lg font-bold border-b border-white">Comments</div>
            {/* 投稿フォーム */}
            <Input
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={300}
            />
            {comment.length > 0 && (
                <div className="flex justify-end">
                    <Button 
                        onClick={handleSubmitComment}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Posting...' : 'Comment'}
                    </Button>
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
                <Link href={`/chart/${chartId}/comments`} className="text-white hover:text-primary">
                    Comments Page →
                </Link>
            </div>
        </div>
    </div>)
}