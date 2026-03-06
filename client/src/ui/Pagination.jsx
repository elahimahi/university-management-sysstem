import React from 'react';

const Pagination = ({ page, pageCount, onPageChange }) => {
  return (
    <nav className="flex items-center gap-2" aria-label="Pagination">
      <button
        className="px-2 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-50"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        &lt;
      </button>
      <span className="text-sm">
        Page {page} of {pageCount}
      </span>
      <button
        className="px-2 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-50"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
      >
        &gt;
      </button>
    </nav>
  );
};

export default Pagination;
