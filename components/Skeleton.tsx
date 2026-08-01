import React from 'react';

interface SkeletonProps {
  className?: string;
  /** Predefined variants */
  variant?: 'text' | 'card' | 'product-grid' | 'blog-list' | 'table-row';
  /** Number of skeleton items to render */
  count?: number;
}

const base = 'animate-pulse bg-gray-200 rounded';

const TextSkeleton = ({ cls = '' }: { cls?: string }) => (
  <div className={`${base} h-4 ${cls}`} />
);

const CardSkeleton = () => (
  <div className="rounded-2xl border border-gray-200 p-6 space-y-4">
    <div className={`${base} h-48 w-full rounded-xl`} />
    <TextSkeleton cls="w-3/4" />
    <TextSkeleton cls="w-full" />
    <TextSkeleton cls="w-1/2" />
  </div>
);

const ProductGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

const BlogListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex gap-6 p-6 rounded-2xl border border-gray-200">
        <div className={`${base} w-48 h-32 rounded-xl shrink-0`} />
        <div className="flex-1 space-y-3">
          <TextSkeleton cls="w-3/4 h-5" />
          <TextSkeleton cls="w-full" />
          <TextSkeleton cls="w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

const TableRowSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex gap-4 p-4 rounded-lg border border-gray-100">
        <div className={`${base} w-10 h-10 rounded-lg`} />
        <TextSkeleton cls="flex-1" />
        <TextSkeleton cls="w-24" />
        <TextSkeleton cls="w-16" />
      </div>
    ))}
  </div>
);

const Skeleton: React.FC<SkeletonProps> = ({ variant = 'text', count, className }) => {
  if (variant === 'card') return <CardSkeleton />;
  if (variant === 'product-grid') return <ProductGridSkeleton count={count} />;
  if (variant === 'blog-list') return <BlogListSkeleton count={count} />;
  if (variant === 'table-row') return <TableRowSkeleton count={count} />;

  // Default: simple text lines
  return (
    <div className={`space-y-3 ${className || ''}`}>
      {Array.from({ length: count || 3 }).map((_, i) => (
        <div
          key={i}
          className={`${base} h-4`}
          style={{ width: `${Math.max(30, 90 - i * 15)}%` }}
        />
      ))}
    </div>
  );
};

export default Skeleton;
