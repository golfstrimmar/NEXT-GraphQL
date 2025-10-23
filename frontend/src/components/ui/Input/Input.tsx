"use client";
import React, { RefObject, useRef, useLayoutEffect } from "react";
import "./input.scss";

interface InputProps {
  typeInput:
    | "text"
    | "textarea"
    | "number"
    | "datetime-local"
    | "email"
    | "tel"
    | "date"
    | "password"
    | "search"
    | "time";
  id: string;
  data: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  inputRef?: RefObject<HTMLInputElement | HTMLTextAreaElement>;
  onClick?: (
    e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement, MouseEvent>
  ) => void;
  activ?: boolean;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  id,
  typeInput,
  data,
  name,
  value,
  onChange,
  inputRef,
  onClick,
  disabled,
  activ,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Используем useLayoutEffect чтобы подгонять высоту до paint
  useLayoutEffect(() => {
    if (typeInput !== "textarea") return;
    const el = textareaRef.current;
    if (!el) return;

    const adjust = () => {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    };
    adjust();
    const raf = requestAnimationFrame(() => adjust());
    return () => cancelAnimationFrame(raf);
  }, [value, typeInput]);

  return (
    <div className="input-field input-field--ui">
      {typeInput === "textarea" ? (
        <textarea
          id={id}
          ref={textareaRef}
          name={name}
          // Гарантируем, что value всегда строка (иначе React выдаст warning)
          value={value ?? ""}
          onChange={onChange}
          onClick={onClick}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
          }}
          className={`${
            activ ? "bg-emerald-400" : ""
          } cursor-pointer border rounded px-1 border-emerald-900`}
          required
        />
      ) : (
        <input
          id={id}
          ref={inputRef as RefObject<HTMLInputElement>}
          name={name}
          type={typeInput}
          value={value ?? ""}
          onChange={onChange}
          onClick={onClick}
          disabled={disabled}
          className={`${
            activ ? "bg-emerald-400" : ""
          } cursor-pointer border rounded px-1 border-emerald-900`}
          required
        />
      )}
      <label htmlFor={data}>{data}</label>
    </div>
  );
};

export default Input;
