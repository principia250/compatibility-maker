export interface ArrowProps {
  className?: string;
  length: number;
  angle: number;
  color: string;
}

export const Arrow = ({ className, length, angle, color }: ArrowProps) => {
  return (
    <div 
      className={`h-[1px] relative ${className}`}
      style={{
        width: `${length}px`,
        transform: `rotate(${angle}deg)`,
        backgroundColor: color,
      }}
    >
      <div 
        className="w-[10px] h-[1px] rotate-[-45deg] absolute top-[4px] right-[-1px]"
        style={{
          backgroundColor: color,
        }}
      ></div>
      <div 
        className="w-[10px] h-[1px] rotate-[45deg] absolute top-[-4px] right-[-1px]"
        style={{
          backgroundColor: color,
        }}
      ></div>
    </div>
  )
}