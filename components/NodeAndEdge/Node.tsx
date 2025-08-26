import { Eye, EyeOff } from "lucide-react";
import clsx from "clsx";

export interface NodeProps {
    id: string;
    score: number;
    text: string;
    displayScore: boolean;
    canHide: boolean;
    isVisible: boolean;
    allCompatibilityExsist: boolean;
}

export const nodeHeight = 60;

export const Node = ({ id, score, text, displayScore, canHide, isVisible, allCompatibilityExsist }: NodeProps) => {
    return (
        <div className={clsx(
            "w-full h-[60px] flex flex-row",
        )}>
            {/* スコア */}
            {displayScore && (
                <div className={clsx(
                    !isVisible && "border-opacity-50 text-white text-opacity-50",
                    allCompatibilityExsist ? "border-primary" : "border-[#FF0000]",
                    "border rounded-l-lg",
                    "w-[50px] h-full p-2",
                    "flex items-center justify-center",
                )}>
                    {score?.toFixed(2) || '0.00'}
                </div>
            )}

            {/* テキスト */}
            <div className={clsx(
                !isVisible && "border-opacity-50 text-white text-opacity-50",
                allCompatibilityExsist ? "border-primary" : "border-[#FF0000]",
                "border-t border-b h-full",
                "flex-1 p-2 flex items-center",
                !displayScore && "border-l rounded-l-lg",
                !canHide && "border-r rounded-r-lg",
            )}>
                <div className={clsx(
                    "line-clamp-2 overflow-hidden text-ellipsis",
                )}>
                    {text}
                </div>
            </div>

            {/* 表示/非表示 */}
            {canHide && (
                <div className={clsx(
                    !isVisible && "border-opacity-50",
                    allCompatibilityExsist ? "border-primary" : "border-[#FF0000]",
                    "w-[40px] h-full border rounded-r-lg",
                    "flex items-center justify-center",
                )}>
                    {isVisible ? (
                        <Eye className="w-6 h-6" />
                    ) : (
                        <EyeOff className="w-6 h-6 text-white text-opacity-50" />
                    )}
                </div>
            )}
        </div>
    )
}