export interface Element {
  id: string;
  text: string;
}

export interface NodeAndEdgeProps {
  leftElements?: Element[];
  rightElements?: Element[];
  compatibilities?: {
    id: string;
    leftElementId: string;
    rightElementId: string;
    compatibilityScore: number | null;
    reverseCompatibilityScore: number | null;
    note?: string;
  }[];
  leftCanHide: boolean;
  rightCanHide: boolean;
  leftDisplayScore: boolean;
  rightDisplayScore: boolean;
  leftCategoryName: string;
  rightCategoryName: string;
  // 編集系
  isEditing: boolean;
  handleCategoryNameChange?: (side: 'left' | 'right', name: string) => void;
  handleAddNode?: (side: 'left' | 'right', name: string) => void;
  handleCompatibilitySave?: (
    leftElementId: string,
    compatibilities: Array<{
      rightElementId: string;
      compatibilityScore: number | null;
      reverseCompatibilityScore: number | null;
      note?: string;
    }>
  ) => void;
  handleNodeNameChange?: (
    elementId: string,
    newName: string,
    side: 'left' | 'right'
  ) => void;
  handleDeleteNode?: (elementId: string, side: 'left' | 'right') => void;
}
