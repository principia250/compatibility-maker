'use client';

import { redirect } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/hooks/use-user';
import { useError } from '@/hooks/use-error';
import Loading from '@/components/loading';
import {
  fetchChartEditData,
  ChartEditData,
} from '@/actions/composed/chart/edit/fetch';
import { saveChartData } from '@/actions/composed/chart/edit/mutation';
import { ExplanatoryNote } from '@/components/NodeAndEdge/ExplanatoryNote';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import NodeAndEdge from '@/components/NodeAndEdge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTranslation } from '@/lib/i18n';
import { CircleAlert, Save } from 'lucide-react';
import clsx from 'clsx';

// 深い比較: ChartEditDataの等価性を判定
function isChartEditDataEqual(
  a: ChartEditData | null,
  b: ChartEditData | null
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;

  if (a.id !== b.id) return false;
  if (a.title !== b.title) return false;
  if (a.isPublic !== b.isPublic) return false;

  const compareCategory = (
    ca: ChartEditData['leftCategory'],
    cb: ChartEditData['leftCategory']
  ) => {
    if (ca.id !== cb.id) return false;
    if (ca.name !== cb.name) return false;
    if (ca.elements.length !== cb.elements.length) return false;
    const sa = [...ca.elements].sort((x, y) => x.id.localeCompare(y.id));
    const sb = [...cb.elements].sort((x, y) => x.id.localeCompare(y.id));
    for (let i = 0; i < sa.length; i++) {
      if (sa[i].id !== sb[i].id) return false;
      if (sa[i].name !== sb[i].name) return false;
    }
    return true;
  };

  if (!compareCategory(a.leftCategory, b.leftCategory)) return false;
  if (!compareCategory(a.rightCategory, b.rightCategory)) return false;

  if (a.compatibilities.length !== b.compatibilities.length) return false;
  const ac = [...a.compatibilities].sort((x, y) => x.id.localeCompare(y.id));
  const bc = [...b.compatibilities].sort((x, y) => x.id.localeCompare(y.id));
  for (let i = 0; i < ac.length; i++) {
    const x = ac[i];
    const y = bc[i];
    if (x.id !== y.id) return false;
    if (x.leftElementId !== y.leftElementId) return false;
    if (x.rightElementId !== y.rightElementId) return false;
    if (x.compatibilityScore !== y.compatibilityScore) return false;
    if (x.reverseCompatibilityScore !== y.reverseCompatibilityScore)
      return false;
  }

  return true;
}

export default function ChartEditPage() {
  const [isLoadingState, setIsLoadingState] = useState<boolean>(true);
  const { t } = useTranslation();
  const { user, isLoading, isAuthenticated } =
    useUser();
  const { addError } = useError();
  const [data, setData] = useState<ChartEditData | null>(null);
  const initialDataRef = useRef<ChartEditData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const params = useParams<{ id: string }>();
  const chartId = params?.id;

  useEffect(() => {
    if (isLoading || user) {
      setIsLoadingState(false);
    }
  }, [isLoading, user]);

  useEffect(() => {
    const fetch = async () => {
      if (!chartId) {
        return;
      }
      if (user?.id === null || user?.id === undefined || user?.id === '') {
        return;
      }

      const { data: data, error: error } = await fetchChartEditData({
        chartId: chartId,
      });
      if (error) {
        addError(error.message);
        return;
      }

      // 作成者チェック
      if (data && data.userId !== user.id) {
        redirect('/');
      }

      setData(data);
      if (initialDataRef.current === null) {
        initialDataRef.current = data;
      }
    };

    // chartIdとuserが存在する場合のみ実行
    if (chartId && user?.id) {
      fetch();
    }
  }, [user, chartId]); // addErrorを依存配列から削除

  // カテゴリ名変更時の処理
  const handleCategoryNameChange = (side: 'left' | 'right', name: string) => {
    setData((prev) => {
      if (!prev) return prev;
      if (side === 'left') {
        return { ...prev, leftCategory: { ...prev.leftCategory, name } };
      }
      return { ...prev, rightCategory: { ...prev.rightCategory, name } };
    });
  };

  const handleAddNode = (side: 'left' | 'right', name: string) => {
    if (name.trim() === '') {
      return;
    }
    setData((prev) => {
      if (!prev) return prev;
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const next =
        side === 'left'
          ? {
              ...prev,
              leftCategory: {
                ...prev.leftCategory,
                elements: [...prev.leftCategory.elements, { id: tempId, name }],
              },
            }
          : {
              ...prev,
              rightCategory: {
                ...prev.rightCategory,
                elements: [
                  ...prev.rightCategory.elements,
                  { id: tempId, name },
                ],
              },
            };
      return next;
    });
  };

  // 相性データの保存処理
  const handleCompatibilitySave = (
    leftElementId: string,
    compatibilities: Array<{
      rightElementId: string;
      compatibilityScore: number | null;
      reverseCompatibilityScore: number | null;
      note?: string;
    }>
  ) => {
    setData((prev) => {
      if (!prev) return prev;

      // 既存のcompatibilitiesから、このleftElementIdに関連するものを除外
      const filteredCompatibilities = prev.compatibilities.filter(
        (c) => c.leftElementId !== leftElementId
      );

      // 新しいcompatibilitiesを追加（compatibilityScoreがnullの場合は除外）
      const newCompatibilities = compatibilities
        .filter((comp) => comp.compatibilityScore !== null) // nullの場合は除外
        .map((comp) => ({
          id: `temp-compat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          leftElementId,
          rightElementId: comp.rightElementId,
          compatibilityScore: comp.compatibilityScore,
          reverseCompatibilityScore: comp.reverseCompatibilityScore,
          note: comp.note || undefined,
        }));

      return {
        ...prev,
        compatibilities: [...filteredCompatibilities, ...newCompatibilities],
      };
    });
  };

  // ノード名の変更処理（左右両方に対応）
  const handleNodeNameChange = (
    elementId: string,
    newName: string,
    side: 'left' | 'right'
  ) => {
    setData((prev) => {
      if (!prev) return prev;

      if (side === 'left') {
        return {
          ...prev,
          leftCategory: {
            ...prev.leftCategory,
            elements: prev.leftCategory.elements.map((element) =>
              element.id === elementId ? { ...element, name: newName } : element
            ),
          },
        };
      } else {
        return {
          ...prev,
          rightCategory: {
            ...prev.rightCategory,
            elements: prev.rightCategory.elements.map((element) =>
              element.id === elementId ? { ...element, name: newName } : element
            ),
          },
        };
      }
    });
  };

  // ノード削除処理（左右両方に対応）
  const handleDeleteNode = (elementId: string, side: 'left' | 'right') => {
    setData((prev) => {
      if (!prev) return prev;

      const nextLeftElements =
        side === 'left'
          ? prev.leftCategory.elements.filter((el) => el.id !== elementId)
          : prev.leftCategory.elements;
      const nextRightElements =
        side === 'right'
          ? prev.rightCategory.elements.filter((el) => el.id !== elementId)
          : prev.rightCategory.elements;

      const nextCompatibilities = prev.compatibilities.filter(
        (c) => c.leftElementId !== elementId && c.rightElementId !== elementId
      );

      return {
        ...prev,
        leftCategory: { ...prev.leftCategory, elements: nextLeftElements },
        rightCategory: { ...prev.rightCategory, elements: nextRightElements },
        compatibilities: nextCompatibilities,
      };
    });
  };

  // チャートデータの保存処理
  const handleSave = async () => {
    // データが存在しなければリターン
    if (!data) return;
    // 各名前が入力されていなかったらリターン
    if (!data.title || !data.leftCategory.name || !data.rightCategory.name)
      return;

    setIsSaving(true);
    try {
      const { data: updatedData, error } = await saveChartData(data);
      if (error) {
        addError(error.message);
        return;
      }

      // 保存成功時は最新データで状態を更新
      if (updatedData) {
        setData(updatedData);
        initialDataRef.current = updatedData;
      }
    } catch {
      addError('Unexpected error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || isLoadingState || !data) {
    return <Loading />;
  }

  if (!isLoading && !isLoadingState && !isAuthenticated) {
    redirect('/auth/login');
  }
  return (
    <div className="relative flex flex-col gap-4">
      {/* 保存中のオーバーレイ */}
      {isSaving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-primary rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p>Saving...</p>
          </div>
        </div>
      )}
      {/* セーブボタン */}
      <div className={clsx(
        "flex flex-col justify-end gap-2",
        "sm:flex-row-reverse sm:items-center sm:justify-end"
        )}>
        <div className="border border-primary rounded-lg px-2 py-2 flex flex-row gap-2 items-center">
          <CircleAlert className="w-8 h-8 text-red-600" />
          {t(
            '(=´ー｀)ノ 保存をお忘れなく！',
            "(=´ー｀)ノ Don't forget to save!"
          )}
        </div>
        {isChartEditDataEqual(initialDataRef.current, data) ? (
          <Button variant="deactive" disabled>
            <Save className="w-4 h-4" />
            Save
          </Button>
        ) : (
          <>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </>
        )}
      </div>
      <div>
        {!data.title && <div className="text-red-600">
          {t('タイトルを入力してください', 'Enter a title.')}
        </div>}
        {!data.leftCategory.name && (
          <div className="text-red-600">
            {t('左側の名前を入力してください', 'Enter a left side name.')}
          </div>
        )}
        {!data.rightCategory.name && (
          <div className="text-red-600">
            {t('右側の名前を入力してください', 'Enter a right side name.')}
          </div>
        )}
      </div>

      {/* chart名 */}
      <Label htmlFor="chart-title" className="text-primary">
        Title
      </Label>
      <Input
        id="chart-title"
        type="text"
        maxLength={100}
        value={data.title}
        onChange={(e) => setData({ ...data, title: e.target.value })}
      />
      {/* 公開設定 */}
      <RadioGroup
        value={data.isPublic ? 'public' : 'private'}
        onValueChange={(value: string) =>
          setData({ ...data, isPublic: value === 'public' })
        }
        className="mb-8"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="public" id="public" />
          <Label htmlFor="public">{`Public (${t('誰でも閲覧可能', 'Anyone can view')})`}</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="private" id="private" />
          <Label htmlFor="private">{`Private (${t('自分のみ閲覧可能', 'Only you can view')})`}</Label>
        </div>
      </RadioGroup>
      {/* 凡例 */}
      <ExplanatoryNote />
      {/* 図 */}
      <NodeAndEdge
        leftElements={data.leftCategory.elements.map((element) => ({
          id: element.id,
          text: element.name,
          displayScore: true,
          canHide: true,
        }))}
        rightElements={data.rightCategory.elements.map((element) => ({
          id: element.id,
          text: element.name,
          displayScore: true,
          canHide: true,
        }))}
        compatibilities={data.compatibilities}
        leftCanHide={true}
        rightCanHide={true}
        leftDisplayScore={true}
        rightDisplayScore={true}
        leftCategoryName={data.leftCategory.name}
        rightCategoryName={data.rightCategory.name}
        // 編集系
        isEditing={true}
        handleCategoryNameChange={handleCategoryNameChange}
        handleAddNode={handleAddNode}
        handleCompatibilitySave={handleCompatibilitySave}
        handleNodeNameChange={handleNodeNameChange}
        handleDeleteNode={handleDeleteNode}
      />

      {/* セーブボタン */}
      <div className={clsx(
        "flex flex-col justify-end gap-2",
        "sm:flex-row-reverse sm:items-center sm:justify-end"
        )}>
        <div className="border border-primary rounded-lg px-2 py-2 flex flex-row gap-2 items-center">
          <CircleAlert className="w-8 h-8 text-red-600" />
          {t(
            '(=´ー｀)ノ 保存をお忘れなく！',
            "(=´ー｀)ノ Don't forget to save!"
          )}
        </div>
        {isChartEditDataEqual(initialDataRef.current, data) ? (
          <Button variant="deactive" disabled>
            <Save className="w-4 h-4" />
            Save
          </Button>
        ) : (
          <>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </>
        )}
      </div>
      <div>
        {!data.title && <div className="text-red-600">
          {t('タイトルを入力してください', 'Enter a title.')}
        </div>}
        {!data.leftCategory.name && (
          <div className="text-red-600">
            {t('左側の名前を入力してください', 'Enter a left side name.')}
          </div>
        )}
        {!data.rightCategory.name && (
          <div className="text-red-600">
            {t('右側の名前を入力してください', 'Enter a right side name.')}
          </div>
        )}
      </div>
    </div>
  );
}
