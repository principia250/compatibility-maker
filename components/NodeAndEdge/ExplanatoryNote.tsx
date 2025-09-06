'use client';

import { COMPABILITY_NOTATION } from "@/constants/compability-notation";
import { COMPABILITY_COLOR } from "@/constants/compability-color";
import { Arrow } from "./Arrow";
import { useTranslation } from "@/lib/i18n";

export const ExplanatoryNote = () => {
    const { t } = useTranslation();

    const drawArrow = (compatibilityScore: number) => {
        return (
            <div className="flex flex-row items-center gap-2">
                <Arrow length={50} angle={0} color={COMPABILITY_COLOR[compatibilityScore.toString() as keyof typeof COMPABILITY_COLOR]} />
                <div className="w-[20px]">
                    {COMPABILITY_NOTATION[compatibilityScore.toString() as keyof typeof COMPABILITY_NOTATION]}
                </div>
                <div>
                    ({compatibilityScore > 0 ? "+" : ""}{compatibilityScore} pt)
                </div>
            </div>
        )
        
    }

    const drawArrowWithNote = () => {
        return (
            <div className="flex flex-row items-center gap-2">
                <Arrow 
                    length={50} 
                    angle={0} 
                    color={"#FFFFFF"} 
                    note={t("備考はここに表示されます。", "Notes will be displayed here.")}
                    leftElementName="item 1"
                    rightElementName="item 2"
                    score={0}
                    scoreNotation="0"
                />
                <div>
                    {t("太い矢印をクリックして備考を表示", "Click thick arrows to view notes")}
                </div>
            </div>
        )
    }
    return (
        <div className="flex flex-col w-fit gap-4 border border-white p-2 rounded-lg">
            <div className="flex flex-col items-start gap-6">
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                        {drawArrow(2)}
                        {drawArrow(1)}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:flex-row-reverse gap-6">
                        {drawArrow(0)}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-6">
                {/* <div className="flex flex-row sm:flex-row-reverse gap-6"> */}
                    <div className="flex flex-col sm:flex-row sm:flex-row-reverse gap-6">
                        {drawArrow(-1)}
                        {drawArrow(-2)}
                    </div>
                    <div>
                        {drawArrowWithNote()}
                    </div>
                </div>
            </div>
        </div>
    )
}