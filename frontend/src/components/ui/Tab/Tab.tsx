"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

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
      <div className="tab   overflow-hidden">
        <button
          className={`tab-header flex items-center justify-center  p-1 cursor-pointer gap-1 ${
            length === 0 ? "opacity-30 cursor-not-allowed" : ""
          }`}
          onClick={() => setIsOpen(!isOpen)}
          disabled={length === 0}
        >
          <span className="text-amber-200 font-medium hover:text-amber-600 transition-colors">
            {length}
          </span>
          <Image
            src="./svg/click-darck.svg"
            alt="arrow-down"
            width={25}
            height={25}
            className={`${
              isOpen ? "rotate-180" : ""
            }  transition-transform duration-300 ease-in-out`}
          />
        </button>

        <AnimatePresence>
          {isOpen && length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: 0 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute left-0 top-full bg-amber-100 text-amber-600 border border-gray-200 rounded-b-md shadow-md z-10 w-fit min-w-[150px] max-w-full"
            >
              <div className="p-1 space-y-2">
                {details.map((detail, index) => (
                  <div key={index} className="flex justify-between">
                    <span className=" font-medium">{detail}</span>
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
