"use client";
import React from "react";
import styles from "./InputCheck.module.scss";

// =================================

interface InputCheckProps {
  type: string;
  data: string;
  value: string; 
  checkedValue: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// =================================

const InputCheck: React.FC<InputCheckProps> = ({
  type,
  data,
  value,
  checkedValue,
  onChange,
}) => {
  return (
    <div className={styles["fildset-checkbox"]}>
      <div className={styles["form-check"]}>
        <input
          id={data}
          name={data}
          type={type}
          checked={value === checkedValue} 
          onChange={(e) => {
            onChange(e);
          }}
          required
        />
        <label htmlFor={data}>{data}</label>
      </div>
    </div>
  );
};

export default InputCheck;
