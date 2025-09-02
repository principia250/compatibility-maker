"use client";

import { redirect } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import Loading from "@/components/loading";
import { fetchMypageData, MypageData } from "@/actions/composed/mypage/fetch";
import { Button } from "@/components/ui/button";
import { Pencil, CopyPlus, Trash2 } from "lucide-react";
import Link from "next/link";
import { CreateChart } from "@/components/dialogs/CreateChart";

export default function MypagePage() {
  const [isLoadingState, setIsLoadingState] = useState<boolean>(true)
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "myChart";
  const { user, isLoading, isAuthenticated, username, fetchUser, logout } = useUser();
  const [mypageData, setMypageData] = useState<MypageData | null>(null)

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
                        <CreateChart>
                            <Button variant="positive" className="w-full">
                                Make a compatibility chart
                            </Button>
                        </CreateChart>
                        :
                        <span className="text-[#ff0000]">
                            You have reached the maximum number of charts you can create.
                        </span>
                    }
                    {
                        mypageData?.charts.map((chart) => (
                            <div className="flex flex-row gap-2 items-center" key={chart.id}>
                                <Link href={`/chart/${chart.id}`} className="flex-1 line-clamp-2 overflow-hidden text-ellipsis cursor-pointer hover:text-primary">
                                    {chart.title}
                                </Link>
                                <Button>Edit<Pencil className="w-4 h-4" /></Button>
                                {mypageData?.maxCharts && mypageData?.charts && mypageData?.charts.length < mypageData?.maxCharts &&
                                    <Button>Duplicate<CopyPlus className="w-4 h-4" /></Button>
                                }
                                <Button variant="destructive">Delete<Trash2 className="w-4 h-4" /></Button>
                            </div>
                        ))
                    }

                </div>
            </TabsContent>

            {/* ブックマーク */}
            <TabsContent value="bookmark">
                <div className="flex flex-col gap-6">
                    {mypageData?.bookmarks.map((bookmark) => (
                        <Link href={`/chart/${bookmark.compatibilityChart.id}`} key={bookmark.id} className=" cursor-pointer hover:text-primary">
                            <div className="flex-1 line-clamp-2 overflow-hidden text-ellipsis">
                                {bookmark.compatibilityChart.title}
                            </div>
                            <div className="text-xs overflow-hidden text-ellipsis">
                                Made by: {bookmark.compatibilityChart.user.username}
                            </div>
                        </Link>
                    ))}
                </div>
            </TabsContent>
        </Tabs>
    </>
  );
}
