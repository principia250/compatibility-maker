'use client';

import { NodeAndEdgeProps } from './type';
import { Node, nodeHeight, nodeHeightSm } from './Node';
import { Arrow } from './Arrow';
import { COMPABILITY_COLOR } from '@/constants/compability-color';
import { COMPABILITY_NOTATION } from '@/constants/compability-notation';
import { useRef, useEffect, useState } from 'react';
import { Label } from '@radix-ui/react-label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { AddNodeDialog } from '@/components/dialogs/chart/edit/AddNode';
import { EditCompatibilityDialog } from '@/components/dialogs/chart/edit/EditCompatibility';
import { EditRightNodeDialog } from '@/components/dialogs/chart/edit/EditRightNode';
import { useTranslation } from '@/lib/i18n';
import { CATEGORY_NAME_MAX_LENGTH } from '@/constants/input-length';

const nodeGap = 20;

const NodeAndEdge = ({
  leftElements,
  rightElements,
  compatibilities,
  leftDisplayScore,
  rightDisplayScore,
  leftCanHide,
  rightCanHide,
  leftCategoryName,
  rightCategoryName,
  isEditing,
  handleCategoryNameChange,
  handleAddNode,
  handleCompatibilitySave,
  handleNodeNameChange,
  handleDeleteNode,
}: NodeAndEdgeProps) => {
  const centerRef = useRef<HTMLDivElement>(null);
  const centerRefSm = useRef<HTMLDivElement>(null);
  const [centerWidth, setCenterWidth] = useState(1);
  const [centerWidthSm, setCenterWidthSm] = useState(1);
  const { t } = useTranslation();
  // propsを再代入
  const [leftElementsLocal, setLeftElementsLocal] = useState(
    leftElements?.map((element) => ({
      ...element,
      isVisible: true,
    }))
  );
  const [rightElementsLocal, setRightElementsLocal] = useState(
    rightElements?.map((element) => ({
      ...element,
      isVisible: true,
    }))
  );

  // 相性編集ダイアログの状態
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLeftNode, setSelectedLeftNode] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // 右側ノード編集ダイアログ
  const [editRightDialogOpen, setEditRightDialogOpen] = useState(false);
  const [selectedRightNode, setSelectedRightNode] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // 外部からの要素変更（追加・削除・名称変更など）をローカル状態へ反映し、並び替えも適用
  useEffect(() => {
    const mappedLeft =
      leftElements?.map((element) => ({
        ...element,
        isVisible:
          leftElementsLocal?.find((e) => e.id === element.id)?.isVisible ??
          true,
      })) ?? [];
    const mappedRight =
      rightElements?.map((element) => ({
        ...element,
        isVisible:
          rightElementsLocal?.find((e) => e.id === element.id)?.isVisible ??
          true,
      })) ?? [];

    const { leftElements: sortedLeft, rightElements: sortedRight } =
      sortElements(mappedLeft, mappedRight);
    setLeftElementsLocal([...sortedLeft]);
    setRightElementsLocal([...sortedRight]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftElements, rightElements]);

  // スコアを計算する関数
  const calculateScore = (
    elementId: string,
    side: 'left' | 'right',
    leftElements: { isVisible: boolean; id: string; text: string }[],
    rightElements: { isVisible: boolean; id: string; text: string }[]
  ) => {
    if (side === 'left') {
      // 自身が非表示であれば0を返す
      if (
        !leftElements?.find((element) => element.id === elementId)?.isVisible
      ) {
        return 0;
      }
      // compatibilitiesからleftElementIdがelementIdのものを取得
      // かつ右側の要素が表示されているもののみを対象とする
      const leftCompatibility = compatibilities?.filter((compatibility) => {
        const rightElement = rightElements?.find(
          (element) => element.id === compatibility.rightElementId
        );
        return (
          compatibility.leftElementId === elementId && rightElement?.isVisible
        );
      });
      // 抽出したcompatibilitiesのcompatibilityScoreを合計
      const sum = leftCompatibility?.reduce(
        (acc, compatibility) => acc + (compatibility.compatibilityScore ?? 0),
        0
      );
      // 合計をlengthで割る
      return sum === undefined ||
        leftCompatibility === undefined ||
        leftCompatibility?.length === 0
        ? 0
        : sum / (leftCompatibility?.length || 0);
    } else {
      // 自身が非表示であれば0を返す
      if (
        !rightElements?.find((element) => element.id === elementId)?.isVisible
      ) {
        return 0;
      }
      // 右側の場合はreverseCompatibilityScoreを使用
      // かつ左側の要素が表示されているもののみを対象とする
      const rightCompatibility = compatibilities?.filter((compatibility) => {
        const leftElement = leftElements?.find(
          (element) => element.id === compatibility.leftElementId
        );
        return (
          compatibility.rightElementId === elementId && leftElement?.isVisible
        );
      });
      const sum = rightCompatibility?.reduce(
        (acc, compatibility) =>
          acc + (compatibility.reverseCompatibilityScore ?? 0),
        0
      );
      return sum === undefined ||
        rightCompatibility === undefined ||
        rightCompatibility?.length === 0
        ? 0
        : sum / (rightCompatibility?.length || 0);
    }
  };

  useEffect(() => {
    if (centerRef.current) {
      const updateWidth = () => {
        const width = centerRef.current?.offsetWidth || 1;
        setCenterWidth(width);
        const widthSm = centerRefSm.current?.offsetWidth || 1;
        setCenterWidthSm(widthSm);
      };

      updateWidth();
      window.addEventListener('resize', updateWidth);

      return () => window.removeEventListener('resize', updateWidth);
    }
  }, []);

  const arrowVariables = compatibilities?.map((compatibility) => {
    // 左側のノードが配列の何番目かを取得
    const leftIndex =
      leftElementsLocal?.findIndex(
        (element) => element.id === compatibility.leftElementId
      ) ?? -1;
    // 右側のノードが配列の何番目かを取得
    const rightIndex =
      rightElementsLocal?.findIndex(
        (element) => element.id === compatibility.rightElementId
      ) ?? -1;

    // インデックスが無効な場合は矢印を表示しない
    if (leftIndex === -1 || rightIndex === -1) {
      return null;
    }

    // 左右どちらかのノードが非表示であれば、矢印を表示しない
    if (
      leftElementsLocal?.[leftIndex]?.isVisible === false ||
      rightElementsLocal?.[rightIndex]?.isVisible === false
    ) {
      return null;
    }

    // ノードの高さの差を計算
    const height = (leftIndex - rightIndex) * (nodeHeight + nodeGap);
    const heightSm = (leftIndex - rightIndex) * (nodeHeightSm + nodeGap);
    const width = centerWidth;
    const widthSm = centerWidthSm;
    const leftElement = leftElementsLocal?.[leftIndex];
    const rightElement = rightElementsLocal?.[rightIndex];
    const score = compatibility.compatibilityScore ?? 0;
    const scoreNotation =
      COMPABILITY_NOTATION[
        score.toString() as keyof typeof COMPABILITY_NOTATION
      ];

    return {
      id: compatibility.id,
      length: Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)),
      lengthSm: Math.sqrt(Math.pow(widthSm, 2) + Math.pow(heightSm, 2)),
      angle: (-Math.atan2(height, width) * 180) / Math.PI,
      angleSm: (-Math.atan2(heightSm, widthSm) * 180) / Math.PI,
      color:
        COMPABILITY_COLOR[score.toString() as keyof typeof COMPABILITY_COLOR],
      y: nodeHeight / 2 + (nodeHeight + nodeGap) * leftIndex - height / 2,
      ySm:
        nodeHeightSm / 2 + (nodeHeightSm + nodeGap) * leftIndex - heightSm / 2,
      leftElementName: leftElement?.text || '',
      rightElementName: rightElement?.text || '',
      score,
      scoreNotation,
      note: compatibility.note || null,
    };
  });

  // ノードから全ての逆側のノードに互換性があるかを確認する関数
  const checkAllCompatibility = (elementId: string, side: 'left' | 'right') => {
    if (side === 'left') {
      // 左側のノードの場合
      // compatibilitiesからleftElementIdがelementIdのものを取得
      const leftCompatibility = compatibilities?.filter(
        (compatibility) => compatibility.leftElementId === elementId
      );
      // 抽出したcompatibilitiesが右側のノードを網羅しているか確認
      return rightElementsLocal!.every((rightElement) =>
        leftCompatibility?.some(
          (compatibility) => compatibility.rightElementId === rightElement.id
        )
      );
    } else {
      // 右側のノードの場合
      // compatibilitiesからrightElementIdがelementIdのものを取得
      const rightCompatibility = compatibilities?.filter(
        (compatibility) => compatibility.rightElementId === elementId
      );
      // 抽出したcompatibilitiesが左側のノードを網羅しているか確認
      return leftElementsLocal!.every((leftElement) =>
        rightCompatibility?.some(
          (compatibility) => compatibility.leftElementId === leftElement.id
        )
      );
    }
  };

  // 一つでも互換性がない場合はfalseを返す関数
  const checkOneCompatibility = () => {
    return leftElementsLocal?.every((leftElement) =>
      checkAllCompatibility(leftElement.id, 'left')
    );
  };

  // 要素を並び替える専用の関数
  const sortElements = (
    leftElements: { isVisible: boolean; id: string; text: string }[],
    rightElements: { isVisible: boolean; id: string; text: string }[]
  ) => {
    return {
      leftElements: leftElements.sort((a, b) => {
        // 第一ソート: 表示→非表示
        if (a.isVisible !== b.isVisible) {
          return a.isVisible ? -1 : 1;
        }
        // 第二ソート: スコアが高い順
        const scoreA = calculateScore(
          a.id,
          'left',
          leftElements ?? [],
          rightElements ?? []
        );
        const scoreB = calculateScore(
          b.id,
          'left',
          leftElements ?? [],
          rightElements ?? []
        );
        if (scoreA !== scoreB) {
          return scoreB - scoreA; // 降順（高い順）
        }
        // 第三ソート: 50音順
        return a.text.localeCompare(b.text);
      }),
      rightElements: rightElements.sort((a, b) => {
        // 第一ソート: 表示→非表示
        if (a.isVisible !== b.isVisible) {
          return a.isVisible ? -1 : 1;
        }
        // 第二ソート: スコアが高い順
        const scoreA = calculateScore(
          a.id,
          'right',
          leftElements ?? [],
          rightElements ?? []
        );
        const scoreB = calculateScore(
          b.id,
          'right',
          leftElements ?? [],
          rightElements ?? []
        );
        if (scoreA !== scoreB) {
          return scoreB - scoreA; // 降順（高い順）
        }
        // 第三ソート: 50音順
        return a.text.localeCompare(b.text);
      }),
    };
  };

  // show/hideをtoggleする関数
  const toggleShowHide = (elementId: string, side: 'left' | 'right') => {
    let newLeftElementsLocal = leftElementsLocal;
    let newRightElementsLocal = rightElementsLocal;
    if (side === 'left') {
      // 値を切り替え
      newLeftElementsLocal = newLeftElementsLocal?.map((element) =>
        element.id === elementId
          ? { ...element, isVisible: !element.isVisible }
          : element
      );
    } else {
      // 値を切り替え
      newRightElementsLocal = newRightElementsLocal?.map((element) =>
        element.id === elementId
          ? { ...element, isVisible: !element.isVisible }
          : element
      );
    }
    // 並び替え専用関数を使用
    const {
      leftElements: sortedLeftElements,
      rightElements: sortedRightElements,
    } = sortElements(newLeftElementsLocal ?? [], newRightElementsLocal ?? []);
    setLeftElementsLocal(sortedLeftElements);
    setRightElementsLocal(sortedRightElements);
  };

  // 左側ノードクリック時の処理
  const handleLeftNodeClick = (elementId: string, elementName: string) => {
    if (isEditing) {
      setSelectedLeftNode({ id: elementId, name: elementName });
      setEditDialogOpen(true);
    }
  };

  return (
    <>
      <div className="w-full flex flex-row overflow-x-hidden">
        {/* 左側 */}
        <div className="flex w-[42%] sm:w-1/3 flex-col gap-[20px]">
          {/* カテゴリ名 */}
          {isEditing ? (
            <div className="h-[60px]">
              <Label htmlFor="left-category-name" className="text-primary">
                Name on this side
              </Label>
              <Input
                id="left-category-name"
                value={leftCategoryName}
                onChange={(e) =>
                  handleCategoryNameChange?.('left', e.target.value)
                }
                maxLength={CATEGORY_NAME_MAX_LENGTH}
              />
            </div>
          ) : (
            <div className="mt-[20px] w-full h-10 flex items-center justify-center bg-primary text-black rounded-lg px-2">
              <div className="text-center leading-tight line-clamp-2 overflow-hidden">
                {leftCategoryName}
              </div>
            </div>
          )}
          {/* ヘッダー */}
          <div className="h-[30px] text-xs flex flex-row justify-between items-center">
            {leftDisplayScore ? (
              <div className="w-[50px] flex flex-col justify-center items-center">
                <span>Average</span>
                <span>score</span>
              </div>
            ) : (
              <div className="w-[50px]"></div>
            )}
            {leftCanHide ? (
              <div className="w-[40px] flex flex-col justify-center items-center">
                <span>Show</span>
                <span>/Hide</span>
              </div>
            ) : (
              <div className="w-[40px]"></div>
            )}
          </div>
          {/* ノード追加ボタン */}
          {isEditing && (
            <AddNodeDialog
              leftSideName={leftCategoryName}
              rightSideName={rightCategoryName}
              defaultSide="left"
              handleAddNode={handleAddNode || (() => {})}
            >
              <Button variant="positive">
                <Plus className="size-4" />
                Add item
              </Button>
            </AddNodeDialog>
          )}
          {/* ノード */}
          {leftElementsLocal?.map((element) => (
            <Node
              key={element.id}
              id={element.id}
              score={calculateScore(
                element.id,
                'left',
                leftElementsLocal ?? [],
                rightElementsLocal ?? []
              )}
              text={element.text}
              displayScore={leftDisplayScore}
              canHide={leftCanHide}
              isVisible={element.isVisible}
              allCompatibilityExsist={
                checkAllCompatibility(element.id, 'left') || !isEditing
              }
              side="left"
              toggleShowHide={toggleShowHide}
              onClick={
                isEditing
                  ? () => handleLeftNodeClick(element.id, element.text)
                  : undefined
              }
            />
          ))}
        </div>

        {/* 中央 */}
        <div
          ref={centerRefSm}
          className="w-[16%] sm:w-1/3 flex justify-center relative hidden sm:flex overflow-x-hidden"
        >
          {arrowVariables?.map((arrowVariable) => {
            if (arrowVariable === null) {
              return null;
            }
            return (
              <div
                className="absolute"
                key={arrowVariable.id}
                style={{
                  top: arrowVariable.ySm + (isEditing ? 190 : 130),
                }}
              >
                <Arrow
                  length={arrowVariable.lengthSm}
                  angle={arrowVariable.angleSm}
                  color={arrowVariable.color}
                  leftElementName={arrowVariable.leftElementName}
                  rightElementName={arrowVariable.rightElementName}
                  score={arrowVariable.score}
                  scoreNotation={arrowVariable.scoreNotation}
                  note={arrowVariable.note || undefined}
                />
              </div>
            );
          })}
        </div>
        <div
          ref={centerRef}
          className="w-[16%] sm:w-1/3 flex justify-center relative sm:hidden overflow-x-hidden"
        >
          {arrowVariables?.map((arrowVariable) => {
            if (arrowVariable === null) {
              return null;
            }
            return (
              <div
                className="absolute"
                key={arrowVariable.id}
                style={{
                  top: arrowVariable.y + (isEditing ? 190 : 130),
                }}
              >
                <Arrow
                  length={arrowVariable.length}
                  angle={arrowVariable.angle}
                  color={arrowVariable.color}
                  leftElementName={arrowVariable.leftElementName}
                  rightElementName={arrowVariable.rightElementName}
                  score={arrowVariable.score}
                  scoreNotation={arrowVariable.scoreNotation}
                  note={arrowVariable.note || undefined}
                />
              </div>
            );
          })}
        </div>

        {/* 右側 */}
        <div className="flex w-[42%] sm:w-1/3 flex-col gap-[20px]">
          {/* カテゴリ名 */}
          {isEditing ? (
            <div className="h-[60px]">
              <Label htmlFor="right-category-name" className="text-primary">
                Name on this side
              </Label>
              <Input
                id="right-category-name"
                value={rightCategoryName}
                onChange={(e) =>
                  handleCategoryNameChange?.('right', e.target.value)
                }
                maxLength={CATEGORY_NAME_MAX_LENGTH}
              />
            </div>
          ) : (
            <div className="mt-[20px] w-full h-10 flex items-center justify-center bg-primary text-black rounded-lg px-2">
              <div className="text-center leading-tight line-clamp-2 overflow-hidden">
                {rightCategoryName}
              </div>
            </div>
          )}
          {/* ヘッダー */}
          <div className="h-[30px] text-xs flex flex-row justify-between items-center">
            {rightDisplayScore ? (
              <div className="w-[50px] flex flex-col justify-center items-center">
                <span>Average</span>
                <span>score</span>
              </div>
            ) : (
              <div className="w-[50px]"></div>
            )}
            {rightCanHide ? (
              <div className="w-[40px] flex flex-col justify-center items-center">
                <span>Show</span>
                <span>/Hide</span>
              </div>
            ) : (
              <div className="w-[40px]"></div>
            )}
          </div>
          {/* ノード追加ボタン */}
          {isEditing && (
            <AddNodeDialog
              leftSideName={leftCategoryName}
              rightSideName={rightCategoryName}
              defaultSide="right"
              handleAddNode={handleAddNode || (() => {})}
            >
              <Button variant="positive">
                <Plus className="size-4" />
                Add item
              </Button>
            </AddNodeDialog>
          )}
          {/* ノード */}
          {rightElementsLocal?.map((element) => (
            <Node
              key={element.id}
              id={element.id}
              score={calculateScore(
                element.id,
                'right',
                leftElementsLocal ?? [],
                rightElementsLocal ?? []
              )}
              text={element.text}
              displayScore={rightDisplayScore}
              canHide={rightCanHide}
              isVisible={element.isVisible}
              allCompatibilityExsist={
                checkAllCompatibility(element.id, 'right') || !isEditing
              }
              side="right"
              toggleShowHide={toggleShowHide}
              onClick={
                isEditing
                  ? () => {
                      setSelectedRightNode({
                        id: element.id,
                        name: element.text,
                      });
                      setEditRightDialogOpen(true);
                    }
                  : undefined
              }
            />
          ))}
        </div>
      </div>
      {checkOneCompatibility() || !isEditing || (
        <div className="text-red-600">
          {t(
            '相性が全て設定されていないアイテムがあります。',
            'There are items for which all compatibility settings have not been configured.'
          )}
        </div>
      )}

      {/* 相性編集ダイアログ */}
      {selectedLeftNode && (
        <EditCompatibilityDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          leftNodeName={selectedLeftNode.name}
          leftCategoryName={leftCategoryName}
          rightCategoryName={rightCategoryName}
          rightNodes={
            rightElementsLocal?.map((el) => ({ id: el.id, name: el.text })) ??
            []
          }
          compatibilities={
            compatibilities?.filter(
              (c) => c.leftElementId === selectedLeftNode.id
            ) ?? []
          }
          onSave={(compatibilities) => {
            if (handleCompatibilitySave && selectedLeftNode) {
              handleCompatibilitySave(selectedLeftNode.id, compatibilities);
            }
          }}
          onLeftNodeNameChange={(newName) => {
            if (handleNodeNameChange && selectedLeftNode) {
              handleNodeNameChange(selectedLeftNode.id, newName, 'left');
            }
          }}
          onDelete={() => {
            if (handleDeleteNode && selectedLeftNode) {
              handleDeleteNode(selectedLeftNode.id, 'left');
            }
          }}
        />
      )}

      {/* 右側ノード編集ダイアログ */}
      {selectedRightNode && (
        <EditRightNodeDialog
          open={editRightDialogOpen}
          onOpenChange={setEditRightDialogOpen}
          rightCategoryName={rightCategoryName}
          initialNodeName={selectedRightNode.name}
          onRename={(newName) => {
            if (handleNodeNameChange && selectedRightNode) {
              handleNodeNameChange(selectedRightNode.id, newName, 'right');
            }
          }}
          onDelete={() => {
            if (handleDeleteNode && selectedRightNode) {
              handleDeleteNode(selectedRightNode.id, 'right');
            }
          }}
        />
      )}
    </>
  );
};

export default NodeAndEdge;
