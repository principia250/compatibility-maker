"use client";

import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import Loading from "@/components/loading";
import { fetchChartEditData, ChartEditData } from "@/actions/composed/chart/edit/fetch";
import { ExplanatoryNote } from "@/components/NodeAndEdge/ExplanatoryNote";
import { useParams } from "next/navigation";

export default function ChartEditPage() {
    const [isLoadingState, setIsLoadingState] = useState<boolean>(true)
    const { user, isLoading, isAuthenticated, username, fetchUser, logout } = useUser();
    const [data, setData] = useState<ChartEditData | null>(null)
    let initialData: ChartEditData | null = null;
    const params = useParams<{ id: string }>();
    const chartId = params?.id;

    useEffect(() => {
        if(isLoading || user) {
            setIsLoadingState(false)
        }
    },[isLoading])

    useEffect(() => {
        const fetch = async () => {
            if (!chartId) {
                return;
            }
            if (user?.id === null || user?.id === undefined || user?.id === '') {
                return;
            }

            const { data: data, error: error } = await fetchChartEditData({ chartId: chartId })
            if (error) {
                throw error
            }
            setData(data)
            initialData = data;
        }
        fetch()
    },[user, chartId])

    if(isLoading || isLoadingState || !data) {
        return <Loading />
    }

    if(!isLoading && !isLoadingState && !isAuthenticated) {
        redirect("/auth/login")
    }
    return (<div className="flex flex-col gap-4">
        {/* セーブボタン */}
        {/* chart名 */}
        {/* 公開設定 */}
        {/* 凡例 */}
        <ExplanatoryNote />
        {/* 図 */}
    </div>)
}