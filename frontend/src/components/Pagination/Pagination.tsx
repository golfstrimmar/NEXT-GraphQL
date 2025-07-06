"use client";
import React from "react";

interface PaginationProps {
  data: any;
  setCurrentPage: any;
  currentPage: number;
  POSTS_PER_PAGE: number;
}

const Pagination: React.FC<PaginationProps> = ({
  data,
  setCurrentPage,
  currentPage,
  POSTS_PER_PAGE,
}) => {
  return (
    <div className="flex justify-center items-center gap-4 mt-6 ">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="
px-3 py-1 rounded text-white cursor-pointer
bg-[#30344c]
hover:bg-[#5b6496]
disabled:bg-gray-700
disabled:cursor-not-allowed
disabled:opacity-50
transition-colors duration-200
focus:outline-none focus:ring-2 focus:ring-blue-400
"
      >
        ← Prev
      </button>
      <span>
        Page {currentPage} of{" "}
        {Math.ceil(data.posts.totalCount / POSTS_PER_PAGE)}
      </span>
      <button
        onClick={() =>
          setCurrentPage((prev) =>
            prev < Math.ceil(data.posts.totalCount / POSTS_PER_PAGE)
              ? prev + 1
              : prev
          )
        }
        disabled={
          currentPage >= Math.ceil(data.posts.totalCount / POSTS_PER_PAGE)
        }
        className="
px-3 py-1 rounded text-white cursor-pointer
bg-[#30344c]
hover:bg-[#5b6496]
disabled:bg-gray-700
disabled:cursor-not-allowed
disabled:opacity-50
transition-colors duration-200
focus:outline-none focus:ring-2 focus:ring-blue-400
"
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;
