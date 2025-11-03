"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./colorsbutton.scss";

const ColorsButton = () => {
  const [openColors, setOpenColors] = useState<boolean>(false);
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([]);
  useEffect(() => {
    if (openColors) {
      const fetchColors = async () => {
        try {
          const response = await fetch("/data/colors.json");
          const data = await response.json();
          setColors(data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchColors();
    }
  }, [openColors]);

  // ==========================
  return (
    <div>
      {openColors && colors && (
        <div className="fixed w-full h-full overflow-auto top-0 left-0 bottom-4 right-4 bg-[rgba(0,0,0,.95)] z-1000 p-4">
          {colors.map((c) => (
            <div
              key={c.name}
              style={{ background: c.hex }}
              className=" flex  items-center p-1 cursor-pointer"
            >
              <span
                className="pl-2 pr-2 rounded bg-amber-50 "
                onClick={() => {
                  navigator.clipboard.writeText(c.name);
                  setOpenColors(false);
                }}
              >
                {c.name}
              </span>
            </div>
          ))}
        </div>
      )}
      <button
        className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-[royalblue] hover:bg-[#7798fc] z-100 text-[cyan] font-bold text-2xl "
        onClick={() => setOpenColors((prev) => !prev)}
      >
        C
      </button>
    </div>
  );
};

export default ColorsButton;
