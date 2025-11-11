import React, { useState, useRef, useEffect } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  resultCount?: number;
  currentIndex?: number;
  onNavigate?: (direction: 'next' | 'prev') => void;
  showNavigation?: boolean;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  onClear,
  resultCount = 0,
  currentIndex = -1,
  onNavigate,
  showNavigation = false,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F or Cmd+F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
      }

      // Escape to clear search
      if (e.key === 'Escape' && query) {
        setQuery('');
        onSearch('');
        onClear?.();
      }

      // Enter to navigate to next result (only if search input is focused)
      if (e.key === 'Enter' && document.activeElement === inputRef.current && showNavigation && onNavigate && resultCount > 0) {
        e.preventDefault();
        if (e.shiftKey) {
          onNavigate('prev');
        } else {
          onNavigate('next');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [query, resultCount, showNavigation, onNavigate, onSearch, onClear]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-center">
        {/* Search Icon */}
        <div className="absolute left-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          className="w-full pl-10 pr-20 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 placeholder:text-gray-400"
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-12 flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 transition-colors"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Result Count / Navigation */}
        {showNavigation && query && resultCount > 0 && (
          <div className="absolute right-3 flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">
              {currentIndex + 1} / {resultCount}
            </span>
            {onNavigate && (
              <div className="flex gap-1">
                <button
                  onClick={() => onNavigate('prev')}
                  className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label="Previous result"
                  disabled={resultCount === 0}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => onNavigate('next')}
                  className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label="Next result"
                  disabled={resultCount === 0}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* No Results Indicator */}
        {query && resultCount === 0 && (
          <div className="absolute right-3 text-xs text-gray-400">No results</div>
        )}
      </div>

      {/* Keyboard Hints */}
      {!query && (
        <div className="absolute top-full left-0 mt-1 text-xs text-gray-400 hidden sm:block">
          Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">Ctrl+F</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">Cmd+F</kbd> to search
        </div>
      )}
    </div>
  );
};

export default SearchBar;

