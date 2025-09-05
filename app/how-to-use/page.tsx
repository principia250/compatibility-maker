"use client";

import { useTranslation } from "@/lib/i18n";
import Image from "next/image";

export default function HowToUsePage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-primary">{t("図の見方", "How to read the chart?")}</h1>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-primary">1. {t("比較対象が持つ要素を確認", "Check the elements of each comparison target")}</h2>
        <div>
          {t(
            "図の右と左、緑の破線で囲まれた領域にはそれぞれの比較対象がもつ要素が列挙されています。画像では例として、自分が持つ属性と対戦相手が持つ属性を比較しています。",
            "The elements possessed by each comparison target are listed in the right and left areas, surrounded by green dotted lines. In the image, for example, the attributes possessed by myself and the attributes possessed by the opponent are compared."
          )}
        </div>
        <Image src="/images/ho-to-use-1-1.png" alt="How to read the chart?" width={900} height={900} className="border-2 border-gray-300" />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-primary">2. {t("要素同士の相性を示す矢印を確認", "Check the arrows showing compatibility between elements")}</h2>
        <div>
          {t(
            "中央には矢印が表示されています。左の要素から見た右の要素の相性が矢印の色で表現されています",
            "The arrow is displayed in the center. The compatibility between the left element and the right element is expressed by the color of the arrow."
          )}
        </div>
        <Image src="/images/ho-to-use-2-1.png" alt="How to read the chart?" width={900} height={900} className="border-2 border-gray-300" />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-primary">3. {t("各要素の相性スコアの平均点を確認", "Check the average compatibility score for each element")}</h2>
        <div>
          {t(
            "要素の右側には、相性スコアの平均点が表示されています。",
            "The average score of compatibility is displayed on the right side of the element."
          )}
        </div>
        <Image src="/images/ho-to-use-3-1.png" alt="How to read the chart?" width={900} height={900} className="border-2 border-gray-300" />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-primary">4. {t("相性の備考を確認", "Check compatibility notes")}</h2>
        <div>
          {t(
            "太い矢印をクリックすると、備考が表示されます。",
            "The notes are displayed when you click on the thick arrow."
          )}
        </div>
        <Image src="/images/ho-to-use-4-1.png" alt="How to read the chart?" width={900} height={900} className="border-2 border-gray-300" />
        <Image src="/images/ho-to-use-4-2.png" alt="How to read the chart?" width={900} height={900} className="border-2 border-gray-300" />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-primary">5. {t("要素の表示/非表示を切り替える", "Toggle element visibility")}</h2>
        <div>
          {t(
            "目のマークをクリックすると、要素の表示/非表示を切り替えることができます。特定の要素に注目したい場合に活用してください。なお、相性スコアの平均点は表示中の要素のみを計算した値です。",
            "Click the eye icon to toggle the visibility of elements. This is useful when you want to focus on specific elements. Note that the average compatibility score is calculated only for the currently visible elements."
          )}
        </div>
        <Image src="/images/ho-to-use-5-1.png" alt="How to read the chart?" width={900} height={900} className="border-2 border-gray-300" />
      </div>
    </div>
  );
}
