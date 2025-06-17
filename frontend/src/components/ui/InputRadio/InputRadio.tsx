"use client";
import React from "react";
import styles from "./InputRadio.module.scss";

// =================================

interface InputRadioProps {
  type: string;
  data: string;
  value: string;
  options: string[]; // Массив возможных значений для радиокнопок
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// =================================

const InputRadio: React.FC<InputRadioProps> = ({
  type,
  data,
  value,
  options,
  onChange,
}) => {
  return (
    <div className={styles["fildset-radio"]}>
      {options.map((option) => (
        <div key={option} className={styles["form-check"]}>
          <input
            id={`${data}-${option}`}
            name={data}
            type={type}
            value={option}
            checked={value === option}
            onChange={onChange}
          />
          <label htmlFor={`${data}-${option}`}>{option}</label>
        </div>
      ))}
    </div>
  );
};

export default InputRadio;
