"use client";
import React, { useEffect, useRef } from "react";
import "./Tabs.scss";
import ButtonTab from "@/components/ui/ButtonTab/ButtonTab";
interface TabsProps {
  handlerburgerClick: () => void;
  isOpen: boolean;
}

const Tabs: React.FC<TabsProps> = () => {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  // ----------------------------------------
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      e.stopPropagation();

      if (
        e.target instanceof Node &&
        !e.target.closest(".button-tab") &&
        !e.target.closest(".next-hidden")
      ) {
        refs.current.forEach((btn) => {
          if (btn && btn.classList.contains("run")) {
            btn.classList.remove("run");
          }
        });
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // ----------------------------------------
  return (
    <div className="tabs">
      <div>
        <ButtonTab refs={refs} name="test" />
        <div className="next-hidden">
          <div className="next-hidden__wrap">
            <ButtonTab refs={refs} name="test1" />
            <div className="next-hidden">
              <div className="next-hidden__wrap">
                <ButtonTab refs={refs} name="test2" />
                <div className="next-hidden">
                  <div className="next-hidden__wrap">test2 content</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tabs;
