'use client';

import { NodeAndEdgeProps } from './type';
import { Node, nodeHeight } from './Node';
import { Arrow } from './Arrow';
import { COMPABILITY_COLOR } from '@/constants/compability-color';
import { useRef, useEffect, useState } from 'react';

const nodeGap = 20;

const NodeAndEdge = ({ leftElements, rightElements, compatibilities }: NodeAndEdgeProps) => {
    const centerRef = useRef<HTMLDivElement>(null);
    const [centerWidth, setCenterWidth] = useState(1);

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
        const leftIndex = leftElements?.findIndex((element) => element.id === compatibility.leftElementId) ?? 0;
        // 右側のノードが配列の何番目かを取得
        const rightIndex = rightElements?.findIndex((element) => element.id === compatibility.rightElementId) ?? 0;
        // 左右どちらかのノードが非表示であれば、矢印を表示しない
        if (leftElements?.[leftIndex].isVisible === false || rightElements?.[rightIndex].isVisible === false) {
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

    return (
        <div className="w-full flex flex-row">
            {/* 左側 */}
            <div className="flex w-1/3 flex-col gap-[20px]">
                {leftElements?.map((element) => (
                    <Node 
                        key={element.id} 
                        id={element.id}
                        score={0} 
                        text={element.text} 
                        displayScore={element.displayScore} 
                        canHide={element.canHide} 
                        isVisible={element.isVisible} 
                        allCompatibilityExsist={element.allCompatibilityExsist} 
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
                                top: arrowVariable.y,
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
                {rightElements?.map((element) => (
                    <Node 
                        key={element.id} 
                        id={element.id}
                        score={0} 
                        text={element.text} 
                        displayScore={element.displayScore} 
                        canHide={element.canHide} 
                        isVisible={element.isVisible} 
                        allCompatibilityExsist={element.allCompatibilityExsist} 
                    />
                ))}
            </div>
        </div>
    )
}

export default NodeAndEdge;