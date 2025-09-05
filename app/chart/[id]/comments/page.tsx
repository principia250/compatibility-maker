"use client";

import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import Loading from "@/components/loading";
import { useParams } from "next/navigation";
import { fetchChartComments, ChartCommentsData } from "@/actions/composed/chart-detail/comments/fetch";
import CustomLink from "@/components/CustomLink";
import { ArrowLeft } from "lucide-react";
import { CommentCard } from "@/components/ui/comment-card";

export default function ChartCommentsPage() {
    const { user, isLoading, isAuthenticated } = useUser();
    const params = useParams<{ id: string }>();
    const chartId = params?.id;
    const [data, setData] = useState<ChartCommentsData | null>(null);

    useEffect(() => {
        const fetch = async () => {
            if (!chartId) {
                return;
            }
            const { data: data, error: error } = await fetchChartComments({ chartId: chartId });
            if (error) {
                throw error;
            }
            setData(data);
        };
        // ユーザー認証のローディングが完了してから実行
        if (!isLoading) {
            fetch();
        }
    }, [chartId, isLoading]);

    if (isLoading || !data) {
        return <Loading />;
    }



    return (
        <div className="flex flex-col gap-6">
            {/* ヘッダー */}
            <div className="flex flex-col gap-4">
                {/* 戻るリンク */}
                <div className="flex items-center gap-2">
                    <CustomLink 
                        href={`/chart/${chartId}`}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Chart
                    </CustomLink>
                </div>
                
                {/* チャート情報 */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold">{data.chart.title}</h1>
                    <div className="text-lg text-gray-300">by {data.chart.user.username}</div>
                </div>
            </div>

            {/* コメント一覧 */}
            <div className="flex flex-col gap-4">
                <div className="text-2xl font-bold border-b border-white pb-2">
                    Comments ({data.comments.length})
                </div>
                
                {data.comments.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                        No comments yet.
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {data.comments.map((comment) => (
                            <CommentCard
                                key={comment.id}
                                comment={comment.content}
                                userName={comment.user.username}
                                createdAt={comment.createdAt}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
