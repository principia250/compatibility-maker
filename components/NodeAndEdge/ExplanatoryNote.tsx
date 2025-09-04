import { COMPABILITY_NOTATION } from "@/constants/compability-notation";
import { COMPABILITY_COLOR } from "@/constants/compability-color";
import { Arrow } from "./Arrow";

export const ExplanatoryNote = () => {
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
                <div className="flex flex-row sm:flex-row-reverse gap-6">
                    <div className="flex flex-col sm:flex-row sm:flex-row-reverse gap-6">
                        {drawArrow(-1)}
                        {drawArrow(-2)}
                    </div>
                </div>
            </div>
        </div>
    )
}