"use client";
<<<<<<< HEAD

import { useState, useEffect } from "react";
import Image from "next/image";
=======
import { useState, useEffect } from "react";
import Image from "next/image";
import "./select.scss";
>>>>>>> simple

interface SelectItem {
  name: string;
  value: string;
}

interface SelectProps {
  selectItems: SelectItem[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name?: string;
  className?: string;
}

export default function Select({
  selectItems,
  value,
  onChange,
  name = "sort-order", // Изменено по умолчанию на sort-order для сортировки
  className = "w-full",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: string) => {
    onChange({
      target: { name, value },
    } as React.ChangeEvent<HTMLSelectElement>);
    setIsOpen(false);
  };
  const selectedItem = selectItems.find((item) => item.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      e.stopPropagation();

      if (
        e.target instanceof Node &&
        !e.target.closest(".select-custom") &&
        !e.target.closest(".next-hidden")
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
<<<<<<< HEAD
    <div className={`relative ${className}`}>
      <div
        className={`select-custom p-2 border border-gray-300 rounded bg-white cursor-pointer flex justify-between items-center transition-all duration-300 ${
          isOpen ? "run" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedItem?.name || "Select sort order"}</span>
        <Image
          src="/assets/svg/chevron-down.svg"
          alt="chevron-down"
          width={15}
          height={15}
          className={`ml-4 transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>
      <div
        className={`z-10 w-full mt-1 bg-white max-h-60 overflow-auto transition-all duration-300 ease-in-out next-hidden`}
      >
        <div className="next-hidden__wrap select-list">
=======
    <div className="relative  ">
      <div
        className={`select-custom 
        border border-gray-300 relative
        rounded bg-[#f8f4e3] cursor-pointer 
        flex justify-between 
        items-center px-2 
        transition-all duration-200 
        max-w-[200px]
        ${isOpen ? "run" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-600 font-medium">
          {selectedItem?.name || "Select sort order"}
        </span>
        <Image
          src="./svg/chevron-down.svg"
          alt="chevron-down"
          width={15}
          height={15}
          className={`ml-4 absolute top-1/2 right-0
          transform transition-transform -translate-1/2
          duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>
      <div
        className={`z-10 max-w-[200px]
        mt-1 bg-white max-h-60 
        overflow-auto transition-all 
        duration-300 ease-in-out next-hidden`}
      >
        <div className="next-hidden__wrap select-list ">
>>>>>>> simple
          <ul>
            {selectItems.map((item, index) => (
              <li
                key={index}
<<<<<<< HEAD
                className={`p-2 cursor-pointer hover:bg-blue-100 ${
                  value === item.value ? "bg-blue-50 font-semibold" : ""
=======
                className={`px-2 cursor-pointer hover:bg-blue-100 ${
                  value === item.value ? "bg-[#f8f4e3] font-semibold" : ""
>>>>>>> simple
                }`}
                onClick={() => handleSelect(item.value)}
              >
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
