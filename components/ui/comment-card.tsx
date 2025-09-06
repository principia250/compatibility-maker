export interface CommentCardProps {
  comment: string;
  userName: string;
  createdAt: string;
}

export const CommentCard = ({
  comment,
  userName,
  createdAt,
}: CommentCardProps) => {
  return (
    <div className="border border-neutral-500 rounded-lg p-4">
      <div className="flex flex-row justify-between items-start gap-4 mb-2">
        <div className="font-semibold text-primary">{userName}</div>
        <div className="text-sm text-neutral-500">
          {new Date(createdAt).toLocaleString()}
        </div>
      </div>
      <div className="text-white">{comment}</div>
    </div>
  );
};
