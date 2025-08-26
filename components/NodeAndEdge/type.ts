export interface Element {
    id: string;
    text: string;
    isVisible: boolean;
    displayScore: boolean;
    canHide: boolean;
    allCompatibilityExsist: boolean;
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
}