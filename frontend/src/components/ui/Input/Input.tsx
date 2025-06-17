"use client";
import React, { RefObject } from "react";
import styles from "./Input.module.scss";

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
  inputRef?: RefObject<HTMLInputElement | HTMLTextAreaElement>; // Сделали необязательным
  onClick?: (
    e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement, MouseEvent>
  ) => void;
  activ?: boolean; // Добавили activ как опциональный пропс
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
  activ,
}) => {
  return (
    <div className={styles["input-field"]}>
      {typeInput === "textarea" ? (
        <textarea
          rows="5"
          id={id}
          name={name}
          value={value}
          ref={inputRef as RefObject<HTMLTextAreaElement>}
          onChange={onChange}
          onClick={onClick}
          className={`${
            activ ? "bg-emerald-400  " : ""
          } cursor-pointer border rounded  px-1   border-emerald-900`}
          required
        />
      ) : (
        <input
          id={id}
          ref={inputRef as RefObject<HTMLInputElement>}
          name={name}
          type={typeInput}
          value={value}
          onChange={onChange}
          onClick={onClick}
          className={
            styles["no-search-cancel"] +
            `${
              activ ? "bg-emerald-400  " : ""
            }   cursor-pointer border rounded  px-1   border-emerald-900`
          }
          required
        />
      )}
      <label htmlFor={data}>{data}</label>
    </div>
  );
};

export default Input;
