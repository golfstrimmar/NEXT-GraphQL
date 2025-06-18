"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TabProps {
  length: number;
  details: string[];
}

const Tab: React.FC<TabProps> = ({ length, details }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const tabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tabRef.current && !tabRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="tab-container relative" ref={tabRef}>
      <div className="tab border border-gray-200 rounded-md bg-white overflow-hidden">
        <div
          className={`tab-header flex items-center justify-center bg-gray-100 p-1 cursor-pointer ${
            length === 0
              ? "opacity-30 cursor-not-allowed"
              : "hover:bg-gray-300 transition-colors"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-gray-600 font-medium">{length}</span>
        </div>

        <AnimatePresence>
          {isOpen && length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: 0 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute right-0 top-full bg-white border border-gray-200 rounded-b-md shadow-md z-10 w-fit min-w-[150px] max-w-full"
            >
              <div className="p-3 space-y-2">
                {details.map((detail, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600 font-medium">{detail}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Tab;
