import clsx from 'clsx';
import { useState } from 'react';
import { CompatibilityNoteDialog } from '@/components/dialogs/chart/CompatibilityNote';

export interface ArrowProps {
  className?: string;
  length: number;
  angle: number;
  color: string;
  // note用
  note?: string;
  leftElementName?: string;
  rightElementName?: string;
  score?: number;
  scoreNotation?: string;
}

export const Arrow = ({
  className,
  length,
  angle,
  color,
  note,
  leftElementName,
  rightElementName,
  score,
  scoreNotation,
}: ArrowProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClick = () => {
    if (note) {
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <div
        className={clsx(
          `relative group`,
          note ? 'h-[3px] cursor-pointer' : 'h-[1px]',
          className
        )}
        style={{
          width: `${length}px`,
          transform: `rotate(${angle}deg)`,
          backgroundColor: color,
        }}
        onClick={handleClick}
      >
        <div
          className={clsx(
            'w-[10px] rotate-[-45deg] absolute top-[4px]',
            note
              ? 'h-[3px] right-[-0.5px] cursor-pointer'
              : 'h-[1px] right-[-1px]'
          )}
          style={{
            backgroundColor: color,
          }}
        ></div>
        <div
          className={clsx(
            'w-[10px] rotate-[45deg] absolute top-[-4px]',
            note
              ? 'h-[3px] right-[-0.5px] cursor-pointer'
              : 'h-[1px] right-[-1px]'
          )}
          style={{
            backgroundColor: color,
          }}
        ></div>
      </div>

      {/* noteが存在する場合のみダイアログを表示 */}
      {note && (
        <CompatibilityNoteDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          leftElementName={leftElementName || ''}
          rightElementName={rightElementName || ''}
          score={score || 0}
          scoreNotation={scoreNotation || ''}
          note={note}
        />
      )}
    </>
  );
};
