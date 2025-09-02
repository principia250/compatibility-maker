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
        compatibilityScore: number;
        reverseCompatibilityScore: number;
    }[];
    leftCanHide: boolean;
    rightCanHide: boolean;
    leftDisplayScore: boolean;
    rightDisplayScore: boolean;
    isEditing: boolean;
    leftCategoryName: string;
    rightCategoryName: string;
}