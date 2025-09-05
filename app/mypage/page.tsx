"use client";

import { redirect } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import Loading from "@/components/loading";
import { fetchMypageData, MypageData } from "@/actions/composed/mypage/fetch";
import { duplicateChart, deleteChart } from "@/actions/composed/mypage/mutation";
import { Button } from "@/components/ui/button";
import { Pencil, CopyPlus, Trash2, MoreVertical } from "lucide-react";
import Link from "next/link";
import { CreateChartDialog } from "@/components/dialogs/chart/create/CreateChart";
import { DeleteChartDialog } from "@/components/dialogs/chart/delete/DeleteChartDialog";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function MypagePage() {
  const [isLoadingState, setIsLoadingState] = useState<boolean>(true)
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "myChart";
  const { user, isLoading, isAuthenticated, username, fetchUser, logout } = useUser();
  const [mypageData, setMypageData] = useState<MypageData | null>(null)
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [chartToDelete, setChartToDelete] = useState<{ id: string; title: string } | null>(null)
  const router = useRouter();

  useEffect(() => {
    if(isLoading || user) {
        setIsLoadingState(false)
    }
  },[isLoading])

  useEffect(() => {
    const fetch = async () => {
        if (user?.id !== null && user?.id !== undefined && user?.id !== '') {
            const { data: mypageData, error: mypageError } = await fetchMypageData({ userId: user.id })
            if (mypageError) {
                throw mypageError
            }
            setMypageData(mypageData)
        }
    }
    fetch()
  },[user])

  const handleDuplicate = async (chartId: string) => {
    setIsDuplicating(chartId);
    try {
      const result = await duplicateChart({ chartId }) as any;
      if (result.error) {
        alert('Duplication failed: ' + result.error.message);
        return;
      }
      
      if (result.data?.newChartId) {
        // 複製成功時は編集画面に遷移
        router.push(`/chart/${result.data.newChartId}/edit`);
      }
    } catch (error) {
      alert('Duplication failed');
    } finally {
      setIsDuplicating(null);
    }
  };

  const handleDeleteClick = (chartId: string, chartTitle: string) => {
    setChartToDelete({ id: chartId, title: chartTitle });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!chartToDelete || !user) return;
    
    setIsDeleting(chartToDelete.id);
    try {
      const result = await deleteChart({ chartId: chartToDelete.id }) as any;
      if (result.error) {
        alert('Delete failed: ' + result.error.message);
        return;
      }
      
      // 削除成功時はデータを再取得
      const mypageData = await fetchMypageData({ userId: user.id });
      if (mypageData.error) {
        throw mypageData.error;
      }
      setMypageData(mypageData.data);
      
      setDeleteDialogOpen(false);
      setChartToDelete(null);
    } catch (error) {
      alert('Delete failed');
    } finally {
      setIsDeleting(null);
    }
  };

  if(isLoading || isLoadingState || !mypageData) {
    return <Loading />
  }

  if(!isLoading && !isLoadingState && !isAuthenticated) {
    redirect("/auth/login")
  }

  return (
    <>
        <Tabs defaultValue={tab}>
            <TabsList className="mb-4">
                <TabsTrigger value="myChart">My charts</TabsTrigger>
                <TabsTrigger value="bookmark">Bookmark</TabsTrigger>
            </TabsList>

            {/* マイチャート */}
            <TabsContent value="myChart">
                <div className="flex flex-col gap-6">
                    {mypageData?.maxCharts && mypageData?.charts && mypageData?.maxCharts > mypageData?.charts.length
                        ?
                        <CreateChartDialog>
                            <Button variant="positive" className="w-full">
                                <Plus className="w-4 h-4" />
                                Create a compatibility chart
                            </Button>
                        </CreateChartDialog>
                        :
                        <span className="text-red-600">
                            You have reached the maximum number of charts you can create.
                        </span>
                    }
                    {
                        mypageData?.charts.map((chart) => (
                            <div className="border border-white rounded-xl p-4 flex flex-row gap-2 items-center" key={chart.id}>
                                <Link href={`/chart/${chart.id}`} className="flex-1 line-clamp-2 overflow-hidden text-ellipsis cursor-pointer hover:text-primary">
                                    {chart.title}
                                </Link>
                                
                                {/* デスクトップ用ボタン */}
                                <div className="hidden sm:flex gap-2">
                                    <Button asChild size="sm">
                                        <Link href={`/chart/${chart.id}/edit`}>
                                            <Pencil className="w-4 h-4" />
                                            Edit
                                        </Link>
                                    </Button>
                                    {mypageData?.maxCharts && mypageData?.charts && mypageData?.charts.length < mypageData?.maxCharts &&
                                        <Button 
                                            size="sm"
                                            onClick={() => handleDuplicate(chart.id)}
                                            disabled={isDuplicating === chart.id}
                                        >
                                            <CopyPlus className="w-4 h-4" />
                                            {isDuplicating === chart.id ? 'Duplicating...' : 'Duplicate'}
                                        </Button>
                                    }
                                    <Button 
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDeleteClick(chart.id, chart.title)}
                                        disabled={isDeleting === chart.id}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {isDeleting === chart.id ? 'Deleting...' : 'Delete'}
                                    </Button>
                                </div>

                                {/* モバイル用三点メニュー */}
                                <div className="sm:hidden">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/chart/${chart.id}/edit`} className="flex items-center gap-2">
                                                    <Pencil className="w-4 h-4" />
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            {mypageData?.maxCharts && mypageData?.charts && mypageData?.charts.length < mypageData?.maxCharts &&
                                                <DropdownMenuItem 
                                                    onClick={() => handleDuplicate(chart.id)}
                                                    disabled={isDuplicating === chart.id}
                                                    className="flex items-center gap-2"
                                                >
                                                    <CopyPlus className="w-4 h-4" />
                                                    {isDuplicating === chart.id ? 'Duplicating...' : 'Duplicate'}
                                                </DropdownMenuItem>
                                            }
                                            <DropdownMenuItem 
                                                onClick={() => handleDeleteClick(chart.id, chart.title)}
                                                disabled={isDeleting === chart.id}
                                                className="flex items-center gap-2 text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                {isDeleting === chart.id ? 'Deleting...' : 'Delete'}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))
                    }

                </div>
            </TabsContent>

            {/* ブックマーク */}
            <TabsContent value="bookmark">
                <div className="flex flex-col gap-6">
                    {mypageData?.bookmarks.map((bookmark) => (
                        <div className="border border-white rounded-xl p-4" key={bookmark.id}>
                            <Link href={`/chart/${bookmark.compatibilityChart.id}`} className=" cursor-pointer hover:text-primary">
                                <div className="flex-1 line-clamp-2 overflow-hidden text-ellipsis">
                                    {bookmark.compatibilityChart.title}
                                </div>
                                <div className="text-xs overflow-hidden text-ellipsis text-gray-400">
                                    Created by: {bookmark.compatibilityChart.user.username}
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </TabsContent>
        </Tabs>
        
        <DeleteChartDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          chartTitle={chartToDelete?.title || ''}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting === chartToDelete?.id}
        />
    </>
  );
}
