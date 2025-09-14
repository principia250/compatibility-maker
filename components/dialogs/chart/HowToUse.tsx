'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n';
import Image from 'next/image';

interface HowToUseProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (dontShowAgain: boolean) => void;
}

export const HowToUse = ({ isOpen, onClose, onComplete }: HowToUseProps) => {
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(1);

  const handleClose = () => {
    onComplete(dontShowAgain);
    onClose();
  };

  const handleNext = () => {
    setPage(page + 1);
  };
  const handlePrevious = () => {
    setPage(page - 1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('相性図の見方', 'How to read the chart?')}
          </DialogTitle>
        </DialogHeader>

        {/* 1ページ目 */}
        {page === 1 && (
          <div>
            {t(
              '左のアイテムから右のアイテムに向かって相性を表す矢印が伸びています。相性はポイントで表現されます。数値が大きいほど有利で、反対に数値がマイナスになると不利になります。',
              'Compatibility arrows extend from the left item to the right item. Compatibility is expressed in points. The higher the value, the more advantageous, and the lower the value, the more disadvantageous.'
            )}
            <Image
              src="/images/how-to-use/how-to-use-1.png"
              alt="How to read the chart?"
              width={900}
              height={900}
            />
          </div>
        )}
        {/* 2ページ目 */}
        {page === 2 && (
          <div>
            {t(
              'アイテムの左側に相性ポイントの平均スコアが表示されています。平均スコアが高いほど有利な組み合わせが多いことを表しています。',
              'The average score of compatibility points is displayed on the left side of the item. The higher the average score, the more advantageous the combination is.'
            )}
            <Image
              src="/images/how-to-use/how-to-use-2.png"
              alt="How to read the chart?"
              width={900}
              height={900}
            />
          </div>
        )}

        {/* チェックボックス */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="dont-show-again"
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
          />
          <label htmlFor="dont-show-again" className="text-sm cursor-pointer">
            {t(
              '以降このダイアログを表示しない',
              'Do not show this dialog again'
            )}
          </label>
        </div>

        <DialogFooter>
          {page > 1 && <Button onClick={handlePrevious}>Previous</Button>}
          {page < 2 && <Button onClick={handleNext}>Next</Button>}
          {page === 2 && <Button onClick={handleClose}>I understand</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
