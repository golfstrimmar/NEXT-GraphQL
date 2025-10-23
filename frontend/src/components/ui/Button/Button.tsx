"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "./Button.module.scss";

interface ButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  buttonText?: string;
  buttonValue?: string;
  buttonType?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  buttonText,
  buttonValue,
  buttonType = "button",
}) => {
  const [ripples, setRipples] = useState<
    { x: number; y: number; size: number; key: number }[]
  >([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleCount = useRef(0);
  const timeouts = useRef<NodeJS.Timeout[]>([]);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;

    const button = buttonRef.current;
    const size = Math.max(button.clientWidth, button.clientHeight);
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    rippleCount.current += 1;
    const key = rippleCount.current;

    setRipples((prev) => [...prev, { x, y, size, key }]);

    const timeoutId = setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.key !== key));
      timeouts.current = timeouts.current.filter((id) => id !== timeoutId);
    }, 700);
    timeouts.current.push(timeoutId);

    if (onClick) onClick(e);
  };

  // Чистка таймаутов при размонтировании
  useEffect(() => {
    return () => {
      timeouts.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeouts.current = [];
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      type={buttonType}
      onClick={handleButtonClick}
      value={buttonValue}
      className={`${styles.rippleButton} ripple-button relative text-white bg-[#30344c] hover:bg-[#9ba8f1] focus:ring-4 focus:outline-none focus:ring-[#2422a7]/50 font-medium rounded-lg w-full px-5 py-2.5 text-center inline-flex items-center justify-center transition duration-200 ease-in-out cursor-pointer overflow-hidden`}
    >
      {ripples.map(({ key, x, y, size }) => (
        <span
          key={key}
          className={`${styles.rippleEffect} absolute bg-white/30 rounded-full`}
          style={{
            width: size,
            height: size,
            left: x,
            top: y,
          }}
        />
      ))}
      {buttonText ? buttonText : children}
    </button>
  );
};

export default Button;
