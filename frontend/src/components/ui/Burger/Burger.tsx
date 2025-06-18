"use client";
import React from "react";
import styles from "./Burger.module.scss";

// ===========================

// ===========================
interface BurgerProps {
  handlerburgerClick: () => void;
  isOpen: boolean;
}

const Burger: React.FC<BurgerProps> = ({ handlerburgerClick, isOpen }) => {
  return (
    <div
      className={`${styles.burger}  ${isOpen ? styles.run : ""} `}
      onClick={() => {
        handlerburgerClick();
      }}
    >
      <div className={`${styles["burger-wrap"]}`}>
        <div className={`${styles["burger-top"]}  `}></div>
        <div className={`${styles["burger-line"]} `}></div>
        <div className={`${styles["burger-bottom"]} `}></div>
      </div>
    </div>
  );
};

export default Burger;
