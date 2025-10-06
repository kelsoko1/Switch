import { cn } from '../../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200 dark:bg-gray-700', className)}
      {...props}
    />
  );
}

// Chat List Skeleton
export function ChatListSkeleton() {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Stream Card Skeleton
export function StreamCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden">
      <Skeleton className="w-full aspect-video" />
      <div className="p-3 space-y-2">
        <div className="flex gap-2">
          <Skeleton className="w-9 h-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Stream Grid Skeleton
export function StreamGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {[...Array(8)].map((_, i) => (
        <StreamCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Wallet Card Skeleton
export function WalletCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-10 w-48" />
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}

// Transaction List Skeleton
export function TransactionListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

// Status Circle Skeleton
export function StatusCircleSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <Skeleton className="w-16 h-16 rounded-full" />
      <Skeleton className="h-3 w-12" />
    </div>
  );
}

// Status Grid Skeleton
export function StatusGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="aspect-square rounded-lg overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
      ))}
    </div>
  );
}

// Message Skeleton
export function MessageSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          <div className="max-w-xs space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className={`h-12 ${i % 2 === 0 ? 'w-48' : 'w-32'}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export { Skeleton };
