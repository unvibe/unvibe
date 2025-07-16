import { Spinner } from '../spinner';

export function ProposalButton({
  label,
  icon: Icon,
  className,
  onClick,
  isLoading = false,
  disabled = false,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      className={`font-mono text-xs p-1 px-3 rounded-lg flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={onClick}
      disabled={isLoading || disabled}
    >
      <span>
        {isLoading ? (
          <div className='w-5 h-5 flex items-center justify-center'>
            <Spinner className='w-4 h-4' />
          </div>
        ) : (
          <Icon className='w-5 h-5' />
        )}
      </span>
      <span>{label}</span>
    </button>
  );
}
