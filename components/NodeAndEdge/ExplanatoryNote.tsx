import { COMPABILITY_NOTATION } from "@/constants/compability-notation";
import { COMPABILITY_COLOR } from "@/constants/compability-color";
import { Arrow } from "./Arrow";

export const ExplanatoryNote = () => {
    return (
        <div className="flex flex-col w-fit gap-4 border border-white p-2 rounded-lg">
            <div className="flex flex-row gap-6">
                <div className="flex flex-row items-center gap-2">
                    <Arrow length={50} angle={0} color={COMPABILITY_COLOR["2"]} />
                    <div className="w-[20px]">
                        {COMPABILITY_NOTATION["2"]}
                    </div>
                    <div>
                        (+2 pt)
                    </div>
                </div>

                <div className="flex flex-row items-center gap-2">
                    <Arrow length={50} angle={0} color={COMPABILITY_COLOR["1"]} />
                    <div className="w-[20px]">
                        {COMPABILITY_NOTATION["1"]}
                    </div>
                    <div>
                        (+1 pt)
                    </div>
                </div>

                <div className="flex flex-row items-center gap-2">
                    <Arrow length={50} angle={0} color={COMPABILITY_COLOR["0"]} />
                    <div className="w-[20px]">
                        {COMPABILITY_NOTATION["0"]}
                    </div>
                    <div>
                        (+0 pt)
                    </div>
                </div>
                
            </div>

            <div className="flex flex-row gap-6">
                <div className="flex flex-row items-center gap-2">
                    <Arrow length={50} angle={0} color={COMPABILITY_COLOR["-2"]} />
                    <div className="w-[20px]">
                        {COMPABILITY_NOTATION["-2"]}
                    </div>
                    <div>
                        (-2 pt)
                    </div>
                </div>

                <div className="flex flex-row items-center gap-2">
                    <Arrow length={50} angle={0} color={COMPABILITY_COLOR["-1"]} />
                    <div className="w-[20px]">
                        {COMPABILITY_NOTATION["-1"]}
                    </div>
                    <div>
                        (-1 pt)
                    </div>
                </div>
            </div>
        </div>
    )
}