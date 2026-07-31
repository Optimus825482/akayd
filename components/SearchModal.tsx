import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Product, BlogPost } from '../types';

interface SearchResult {
  type: 'blog' | 'product';
  id: string;
  title: string;
  description: string;
  link: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  blogPosts: BlogPost[];
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, products, blogPosts }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input and reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const results = useMemo((): SearchResult[] => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();

    const blogMatches: SearchResult[] = blogPosts
      .filter(
        post =>
          post.title.toLowerCase().includes(q) ||
          (post.summary && post.summary.toLowerCase().includes(q)) ||
          (post.excerpt && post.excerpt.toLowerCase().includes(q)) ||
          (post.content && post.content.toLowerCase().includes(q))
      )
      .map(post => ({
        type: 'blog' as const,
        id: post.id,
        title: post.title,
        description: post.summary || post.excerpt || '',
        link: `/blog#${post.id}`,
      }));

    const productMatches: SearchResult[] = products
      .filter(
        product =>
          product.name.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q)
      )
      .map(product => ({
        type: 'product' as const,
        id: product.id,
        title: product.name,
        description: product.description,
        link: `/urun/${product.id}`,
      }));

    return [...blogMatches, ...productMatches];
  }, [query, blogPosts, products]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl mx-auto mt-20 p-6 shadow-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="relative mb-4">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Blog yazısı veya ürün ara..."
            className="w-full pl-10 pr-4 py-3 text-lg border-b-2 border-green-600 dark:border-green-500 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-green-700 transition-colors"
          />
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1">
          {query.trim() && results.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-lg font-medium">Sonuç bulunamadı</p>
              <p className="text-sm mt-1">
                &quot;{query}&quot; için herhangi bir sonuç bulunamadı.
              </p>
            </div>
          )}

          {results.length > 0 && (
            <ul className="space-y-1">
              {results.map(result => (
                <li key={`${result.type}-${result.id}`}>
                  <Link
                    to={result.link}
                    onClick={onClose}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <span className="text-sm mt-0.5 shrink-0">
                      {result.type === 'blog' ? '📝' : '📦'}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
                          {result.type === 'blog' ? 'Blog' : 'Ürün'}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors truncate">
                        {result.title}
                      </h3>
                      {result.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {result.description.slice(0, 120)}
                          {result.description.length > 120 ? '...' : ''}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer hint */}
        {!query.trim() && (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            <p className="text-sm">Ürün veya blog yazısı aramak için yukarıya yazmaya başlayın.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
