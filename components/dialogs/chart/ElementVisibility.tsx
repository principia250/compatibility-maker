'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n';

interface Element {
  id: string;
  name: string;
}

interface ElementVisibilityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (hiddenElementIds: string[]) => void;
  leftCategoryName: string;
  rightCategoryName: string;
  leftElements: Element[];
  rightElements: Element[];
}

export const ElementVisibilityDialog = ({
  isOpen,
  onClose,
  onConfirm,
  leftCategoryName,
  rightCategoryName,
  leftElements,
  rightElements,
}: ElementVisibilityDialogProps) => {
  const [leftElementStates, setLeftElementStates] = useState<
    Record<string, boolean>
  >({});
  const [rightElementStates, setRightElementStates] = useState<
    Record<string, boolean>
  >({});
  const [leftAllChecked, setLeftAllChecked] = useState<boolean>(false);
  const [rightAllChecked, setRightAllChecked] = useState<boolean>(false);
  const { t } = useTranslation();

  // 初期化：全ての要素をチェックなし状態で開始
  useEffect(() => {
    if (isOpen) {
      const leftStates = leftElements.reduce(
        (acc, element) => {
          acc[element.id] = false;
          return acc;
        },
        {} as Record<string, boolean>
      );

      const rightStates = rightElements.reduce(
        (acc, element) => {
          acc[element.id] = false;
          return acc;
        },
        {} as Record<string, boolean>
      );

      setLeftElementStates(leftStates);
      setRightElementStates(rightStates);
      setLeftAllChecked(false);
      setRightAllChecked(false);
    }
  }, [isOpen, leftElements, rightElements]);

  // 左カテゴリの全選択/全解除
  const handleLeftAllChange = (checked: boolean) => {
    const newStates = leftElements.reduce(
      (acc, element) => {
        acc[element.id] = checked;
        return acc;
      },
      {} as Record<string, boolean>
    );

    setLeftElementStates(newStates);
    setLeftAllChecked(checked);
  };

  // 右カテゴリの全選択/全解除
  const handleRightAllChange = (checked: boolean) => {
    const newStates = rightElements.reduce(
      (acc, element) => {
        acc[element.id] = checked;
        return acc;
      },
      {} as Record<string, boolean>
    );

    setRightElementStates(newStates);
    setRightAllChecked(checked);
  };

  // 左カテゴリの個別要素チェック
  const handleLeftElementChange = (elementId: string, checked: boolean) => {
    const newStates = { ...leftElementStates, [elementId]: checked };
    setLeftElementStates(newStates);

    // 全選択状態を更新
    const allChecked = Object.values(newStates).every(Boolean);
    setLeftAllChecked(allChecked);
  };

  // 右カテゴリの個別要素チェック
  const handleRightElementChange = (elementId: string, checked: boolean) => {
    const newStates = { ...rightElementStates, [elementId]: checked };
    setRightElementStates(newStates);

    // 全選択状態を更新
    const allChecked = Object.values(newStates).every(Boolean);
    setRightAllChecked(allChecked);
  };

  // 決定ボタンクリック
  const handleConfirm = () => {
    const hiddenElementIds: string[] = [];

    // チェックが外れている要素のIDを収集
    Object.entries(leftElementStates).forEach(([id, checked]) => {
      if (!checked) hiddenElementIds.push(id);
    });

    Object.entries(rightElementStates).forEach(([id, checked]) => {
      if (!checked) hiddenElementIds.push(id);
    });

    onConfirm(hiddenElementIds);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>
            {t('表示するアイテムを選択', 'Select the items to display')}
          </DialogTitle>
          <DialogDescription>
            {t(
              '表示するアイテムにチェックしてください。',
              'Check the items to display.'
            )}
            <br />
            {t(
              'アイテムの表示/非表示は画面からいつでも切り替えられます。',
              'The display/hide of the items can be changed from the screen at any time.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-hidden">
          {/* 左カテゴリ */}
          <div className="space-y-3 overflow-hidden">
            <div className="flex items-center space-x-2 min-w-0">
              <Checkbox
                id="left-all"
                checked={leftAllChecked}
                onCheckedChange={(checked) =>
                  handleLeftAllChange(checked as boolean)
                }
              />
              <label
                htmlFor="left-all"
                className="text-sm cursor-pointer truncate flex-1 min-w-0 max-w-full"
              >
                {leftCategoryName}
              </label>
            </div>

            <div className="ml-6 space-y-2">
              {leftElements.map((element) => (
                <div
                  key={element.id}
                  className="flex items-center space-x-2 min-w-0"
                >
                  <Checkbox
                    id={`left-${element.id}`}
                    checked={leftElementStates[element.id] || false}
                    onCheckedChange={(checked) =>
                      handleLeftElementChange(element.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`left-${element.id}`}
                    className="text-sm cursor-pointer truncate flex-1 min-w-0 max-w-full"
                  >
                    {element.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 右カテゴリ */}
          <div className="space-y-3 overflow-hidden">
            <div className="flex items-center space-x-2 min-w-0">
              <Checkbox
                id="right-all"
                checked={rightAllChecked}
                onCheckedChange={(checked) =>
                  handleRightAllChange(checked as boolean)
                }
              />
              <label
                htmlFor="right-all"
                className="text-sm font-medium cursor-pointer truncate flex-1 min-w-0 max-w-full"
              >
                {rightCategoryName}
              </label>
            </div>

            <div className="ml-6 space-y-2">
              {rightElements.map((element) => (
                <div
                  key={element.id}
                  className="flex items-center space-x-2 min-w-0"
                >
                  <Checkbox
                    id={`right-${element.id}`}
                    checked={rightElementStates[element.id] || false}
                    onCheckedChange={(checked) =>
                      handleRightElementChange(element.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`right-${element.id}`}
                    className="text-sm cursor-pointer truncate flex-1 min-w-0 max-w-full"
                  >
                    {element.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
