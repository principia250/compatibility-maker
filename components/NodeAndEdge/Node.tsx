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
    side: 'left' | 'right';
    toggleShowHide: (elementId: string, side: 'left' | 'right') => void;
    onClick?: () => void;
}

export const nodeHeight = 48;
export const nodeHeightSm = 60;

export const Node = ({ 
    id, 
    score, 
    text, 
    displayScore, 
    canHide, 
    isVisible, 
    allCompatibilityExsist, 
    side, 
    toggleShowHide, 
    onClick 
}: NodeProps) => {
    return (
        <div className={clsx(
            "w-full h-[48px] sm:h-[60px] flex flex-row",
        )}>
            {/* スコア */}
            {displayScore && (
                <div className={clsx(
                    !isVisible && "border-opacity-50 text-white text-opacity-50",
                    allCompatibilityExsist ? "border-primary" : "border-[#FF0000]",
                    "border rounded-l-lg",
                    "text-xs sm:text-base w-[35px] sm:w-[50px] h-full p-2",
                    "flex items-center justify-center",
                )}>
                    {/* {score?.toFixed(2) || '0.00'} */}
                    {isVisible ? score?.toFixed(2) || '0.00' : '-'}
                </div>
            )}

            {/* テキスト */}
            <div className={clsx(
                !isVisible && "border-opacity-50 text-white text-opacity-50",
                allCompatibilityExsist ? "border-primary" : "border-[#FF0000]",
                "border-t border-b h-full",
                "flex-1 text-xs sm:text-base p-1 sm:p-2 flex items-center",
                !displayScore && "border-l rounded-l-lg",
                !canHide && "border-r rounded-r-lg",
                onClick && "cursor-pointer hover:bg-gray-100 hover:bg-opacity-10",
            )}
                onClick={onClick}
            >
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
                    "w-[20px] sm:w-[40px] h-full border rounded-r-lg",
                    "flex items-center justify-center",
                    "cursor-pointer",
                )}
                    onClick={() => toggleShowHide(id, side)}
                >
                    {isVisible ? (
                        <Eye className="w-4 h-4 sm:w-6 sm:h-6" />
                    ) : (
                        <EyeOff className="w-4 h-4 sm:w-6 sm:h-6 text-white text-opacity-50" />
                    )}
                </div>
            )}
        </div>
    )
}