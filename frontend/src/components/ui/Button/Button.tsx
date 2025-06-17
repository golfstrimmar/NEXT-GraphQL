"use client";
import React, { useState } from "react";
import styles from "./Button.module.scss";
interface ButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  buttonText?: string;
  buttonValue?: string;
  buttonType?: string;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  buttonText,
  buttonValue,
  buttonType,
}) => {
  const [ripples, setRipples] = useState<
    { x: number; mValue: number; y: number; key: number }[]
  >([]);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLElement;
    const closestButton = target.closest(".ripple-button");

    if (closestButton) {
      const mValue = Math.max(
        closestButton.clientWidth,
        closestButton.clientHeight
      );
      const rect = closestButton.getBoundingClientRect();
      const x = e.clientX - rect.left - mValue / 2;
      const y = e.clientY - rect.top - mValue / 2;

      const newRipple = { x, y, mValue, key: Date.now() };
      setRipples((prev) => [...prev, newRipple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.key !== newRipple.key));
      }, 1000);
    }

    if (onClick) onClick(e);
  };
  return (
    <>
      <button
        type={buttonType}
        onClick={(e) => {
          handleButtonClick(e);
        }}
        value={buttonValue}
        className={`${styles.rippleButton} ripple-button relative text-white bg-[#2422a7] hover:bg-[#9ba8f1] focus:ring-4 focus:outline-none focus:ring-[#2422a7]/50 font-medium rounded-lg w-full mt-4  px-5 py-2.5 text-center inline-flex items-center justify-center transition duration-200 ease-in-out cursor-pointer overflow-hidden `}
      >
        {ripples.map((ripple) => (
          <span
            key={ripple.key}
            className={`${styles.rippleEffect}  absolute bg-white/30 rounded-full`}
            style={{
              width: `${ripple.mValue}px`,
              height: `${ripple.mValue}px`,
              left: `${ripple.x}px`,
              top: `${ripple.y}px`,
            }}
          />
        ))}
        {buttonText ? buttonText : children}
      </button>
    </>
  );
};

export default Button;
