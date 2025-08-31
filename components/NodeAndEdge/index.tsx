'use client';

import { NodeAndEdgeProps } from './type';
import { Node, nodeHeight } from './Node';
import { Arrow } from './Arrow';
import { COMPABILITY_COLOR } from '@/constants/compability-color';
import { useRef, useEffect, useState } from 'react';

const nodeGap = 20;

const NodeAndEdge = ({ leftElements, rightElements, compatibilities, leftDisplayScore, rightDisplayScore, leftCanHide, rightCanHide, isEditing }: NodeAndEdgeProps) => {
    const centerRef = useRef<HTMLDivElement>(null);
    const [centerWidth, setCenterWidth] = useState(1);
    // propsを再代入
    const [leftElementsLocal, setLeftElementsLocal] = useState(
        leftElements?.map((element) => ({
            ...element,
            isVisible: true,
        }))
    );
    const [rightElementsLocal, setRightElementsLocal] = useState(
        rightElements?.map((element) => ({
            ...element,
            isVisible: true,
        }))
    );
    
    // スコアを計算する関数
    const calculateScore = (
        elementId: string, side: 'left' | 'right',
        leftElements: { isVisible: boolean; id: string; text: string; }[],
        rightElements: { isVisible: boolean; id: string; text: string; }[],
    ) => {
        if (side === 'left') {
            // 自身が非表示であれば0を返す
            if (!leftElements?.find(element => element.id === elementId)?.isVisible) {
                return 0;
            }
            // compatibilitiesからleftElementIdがelementIdのものを取得
            // かつ右側の要素が表示されているもののみを対象とする
            const leftCompatibility = compatibilities?.filter((compatibility) => {
                const rightElement = rightElements?.find(element => element.id === compatibility.rightElementId);
                return compatibility.leftElementId === elementId && rightElement?.isVisible;
            });
            // 抽出したcompatibilitiesのcompatibilityScoreを合計
            const sum = leftCompatibility?.reduce((acc, compatibility) => acc + compatibility.compatibilityScore, 0)
            // 合計をlengthで割る
            return (sum === undefined || leftCompatibility === undefined || leftCompatibility?.length === 0) ? 0 : sum / (leftCompatibility?.length || 0)
        } else {
            // 自身が非表示であれば0を返す
            if (!rightElements?.find(element => element.id === elementId)?.isVisible) {
                return 0;
            }
            // 右側の場合はreverseCompatibilityScoreを使用
            // かつ左側の要素が表示されているもののみを対象とする
            const rightCompatibility = compatibilities?.filter((compatibility) => {
                const leftElement = leftElements?.find(element => element.id === compatibility.leftElementId);
                return compatibility.rightElementId === elementId && leftElement?.isVisible;
            });
            const sum = rightCompatibility?.reduce((acc, compatibility) => acc + compatibility.reverseCompatibilityScore, 0)
            return (sum === undefined || rightCompatibility === undefined || rightCompatibility?.length === 0) ? 0 : sum / (rightCompatibility?.length || 0)
        }
    }

    useEffect(() => {
        if (centerRef.current) {
            const updateWidth = () => {
                const width = centerRef.current?.offsetWidth || 1;
                setCenterWidth(width);
            };
            
            updateWidth();
            window.addEventListener('resize', updateWidth);
            
            return () => window.removeEventListener('resize', updateWidth);
        }
    }, []);

    const arrowVariables = compatibilities?.map((compatibility) => {
        // 左側のノードが配列の何番目かを取得
        const leftIndex = leftElementsLocal?.findIndex((element) => element.id === compatibility.leftElementId) ?? -1;
        // 右側のノードが配列の何番目かを取得
        const rightIndex = rightElementsLocal?.findIndex((element) => element.id === compatibility.rightElementId) ?? -1;
        
        // インデックスが無効な場合は矢印を表示しない
        if (leftIndex === -1 || rightIndex === -1) {
            return null;
        }
        
        // 左右どちらかのノードが非表示であれば、矢印を表示しない
        if (leftElementsLocal?.[leftIndex]?.isVisible === false || rightElementsLocal?.[rightIndex]?.isVisible === false) {
            return null;
        }
        
        // ノードの高さの差を計算
        const height = (leftIndex - rightIndex) * (nodeHeight + nodeGap)
        const width = centerWidth
        return {
            id: compatibility.id,
            length: Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)),
            angle: -Math.atan2(height, width) * 180 / Math.PI,
            color: COMPABILITY_COLOR[compatibility.compatibilityScore.toString() as keyof typeof COMPABILITY_COLOR],
            y: nodeHeight / 2 + (nodeHeight + nodeGap) * leftIndex - height / 2,
        }
    })

    // ノードから全ての逆側のノードに互換性があるかを確認する関数
    const checkAllCompatibility = (elementId: string, side: 'left' | 'right') => {
        if (side === 'left') {
            // 左側のノードの場合
            // compatibilitiesからleftElementIdがelementIdのものを取得
            const leftCompatibility = compatibilities?.filter((compatibility) => compatibility.leftElementId === elementId)
            // 抽出したcompatibilitiesが右側のノードを網羅しているか確認
            return rightElementsLocal!.every((rightElement) => leftCompatibility?.some((compatibility) => compatibility.rightElementId === rightElement.id))
        } else {
            // 右側のノードの場合
            // compatibilitiesからrightElementIdがelementIdのものを取得
            const rightCompatibility = compatibilities?.filter((compatibility) => compatibility.rightElementId === elementId)
            // 抽出したcompatibilitiesが左側のノードを網羅しているか確認
            return leftElementsLocal!.every((leftElement) => rightCompatibility?.some((compatibility) => compatibility.leftElementId === leftElement.id))
        }
    }

    // 一つでも互換性がない場合はfalseを返す関数
    const checkOneCompatibility = () => {
        return leftElementsLocal?.some((leftElement) => checkAllCompatibility(leftElement.id, 'left'))
    }

    // 要素を並び替える専用の関数
    const sortElements = (
        // elements: { isVisible: boolean; id: string; text: string; }[] | undefined, 
        leftElements: { isVisible: boolean; id: string; text: string; }[],
        rightElements: { isVisible: boolean; id: string; text: string; }[],
    ) => {
        return {
            leftElements: leftElements.sort((a, b) => {
                // 第一ソート: 表示→非表示
                if (a.isVisible !== b.isVisible) {
                    return a.isVisible ? -1 : 1;
                }
                // 第二ソート: スコアが高い順
                const scoreA = calculateScore(
                    a.id, 'left',
                    leftElements ?? [],
                    rightElements ?? []
                );
                const scoreB = calculateScore(
                    b.id, 'left',
                    leftElements ?? [],
                    rightElements ?? []
                );
                if (scoreA !== scoreB) {
                    return scoreB - scoreA; // 降順（高い順）
                }
                // 第三ソート: 50音順
                return a.text.localeCompare(b.text);
            }),
            rightElements: rightElements.sort((a, b) => {
                // 第一ソート: 表示→非表示
                if (a.isVisible !== b.isVisible) {
                    return a.isVisible ? -1 : 1;
                }
                // 第二ソート: スコアが高い順
                const scoreA = calculateScore(
                    a.id, 'right',
                    leftElements ?? [],
                    rightElements ?? []
                );
                const scoreB = calculateScore(
                    b.id, 'right',
                    leftElements ?? [],
                    rightElements ?? []
                );
                if (scoreA !== scoreB) {
                    return scoreB - scoreA; // 降順（高い順）
                }
                // 第三ソート: 50音順
                return a.text.localeCompare(b.text);
            })
        }
        // return elements?.sort((a, b) => {
            // 第一ソート: 表示→非表示
            // if (a.isVisible !== b.isVisible) {
            //     return a.isVisible ? -1 : 1;
            // }
            // 第二ソート: スコアが高い順
            // const scoreA = calculateScore(a.id, side);
            // const scoreB = calculateScore(b.id, side);
            // if (scoreA !== scoreB) {
            //     return scoreB - scoreA; // 降順（高い順）
            // }
            // return 0;
            // 第三ソート: 50音順
            // return a.text.localeCompare(b.text);
        // });
    };

    // show/hideをtoggleする関数
    const toggleShowHide = (elementId: string, side: 'left' | 'right') => {
        let newLeftElementsLocal = leftElementsLocal
        let newRightElementsLocal = rightElementsLocal
        if (side === 'left') {
            // 値を切り替え
            newLeftElementsLocal = newLeftElementsLocal?.map((element) => element.id === elementId ? { ...element, isVisible: !element.isVisible } : element)
        } else {
            // 値を切り替え
            newRightElementsLocal = newRightElementsLocal?.map((element) => element.id === elementId ? { ...element, isVisible: !element.isVisible } : element)
        }
        // 並び替え専用関数を使用
        const { leftElements: sortedLeftElements, rightElements: sortedRightElements } 
            = sortElements(newLeftElementsLocal ?? [], newRightElementsLocal ?? []);
        setLeftElementsLocal(sortedLeftElements)
        setRightElementsLocal(sortedRightElements)
    }

    return (
        <>
            <div className="w-full flex flex-row">
                {/* 左側 */}
                <div className="flex w-1/3 flex-col gap-[20px]">
                    <div className="h-[30px] text-xs flex flex-row justify-between items-center">
                        {leftDisplayScore ? (
                            <div className="w-[50px] flex flex-col justify-center items-center">
                                <span>Average</span>
                                <span>score</span>
                            </div>
                        ) : (
                            <div className="w-[50px]"></div>
                        )}
                        {leftCanHide ? (
                            <div className="w-[40px] flex flex-col justify-center items-center">
                                <span>Show</span>
                                <span>/Hide</span>
                            </div>
                        ) : (
                            <div className="w-[40px]"></div>
                        )}
                    </div>
                    {leftElementsLocal?.map((element) => (
                        <Node 
                            key={element.id} 
                            id={element.id}
                            score={calculateScore(
                                element.id, 'left',
                                leftElementsLocal ?? [],
                                rightElementsLocal ?? []
                            )} 
                            text={element.text} 
                            displayScore={leftDisplayScore} 
                            canHide={leftCanHide} 
                            isVisible={element.isVisible} 
                            allCompatibilityExsist={checkAllCompatibility(element.id, 'left') || !isEditing} 
                            side="left"
                            toggleShowHide={toggleShowHide}
                        />
                    ))}
                </div>

                {/* 中央 */}
                <div ref={centerRef} className="w-1/3 flex justify-center relative">
                    {arrowVariables?.map((arrowVariable) => {
                        if (arrowVariable === null) {
                            return null;
                        }
                        return (
                            <div
                                key={arrowVariable.id}
                                className="absolute"
                                style={{
                                    top: arrowVariable.y + 50,
                                }}
                            >
                                <Arrow
                                    length={arrowVariable.length}
                                    angle={arrowVariable.angle}
                                    color={arrowVariable.color}
                                />
                            </div>
                        )
                    })}
                </div>

                {/* 右側 */}
                <div className="flex w-1/3 flex-col gap-[20px]">
                    <div className="h-[30px] text-xs flex flex-row justify-between items-center">
                        {rightDisplayScore ? (
                            <div className="w-[50px] flex flex-col justify-center items-center">
                                <span>Average</span>
                                <span>score</span>
                            </div>
                        ) : (
                            <div className="w-[50px]"></div>
                        )}
                        {rightCanHide ? (
                            <div className="w-[40px] flex flex-col justify-center items-center">
                                <span>Show</span>
                                <span>/Hide</span>
                            </div>
                        ) : (
                            <div className="w-[40px]"></div>
                        )}
                    </div>
                    {rightElementsLocal?.map((element) => (
                        <Node 
                            key={element.id} 
                            id={element.id}
                            score={calculateScore(
                                element.id, 'right',
                                leftElementsLocal ?? [],
                                rightElementsLocal ?? []
                            )} 
                            text={element.text} 
                            displayScore={rightDisplayScore} 
                            canHide={rightCanHide} 
                            isVisible={element.isVisible} 
                            allCompatibilityExsist={checkAllCompatibility(element.id, 'right') || !isEditing} 
                            side="right"
                            toggleShowHide={toggleShowHide}
                        />
                    ))}
                </div>
            </div>
            {(checkOneCompatibility() || !isEditing) || (
                <div className="text-[#ff0000]">There are nodes for which all compatibility settings have not been configured.</div>
            )}
        </>
    )
}

export default NodeAndEdge;