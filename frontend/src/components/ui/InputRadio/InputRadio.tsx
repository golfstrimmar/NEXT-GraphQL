"use client";
import React from "react";
// import "./InputRadio.scss";

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
  onChange: addClass,
}) => {
  return (
    <div className="fildset-radio">
      {options.map((option) => (
        <div key={option} className="form-radio">
          <input
            id={`${data}-${option}`}
            name={data}
            type={type}
            value={option}
            checked={value === option}
            onChange={(e) => {
              addClass(e.target.value);
            }}
          />
          <label htmlFor={`${data}-${option}`}>{option}</label>
        </div>
      ))}
    </div>
  );
};

export default InputRadio;
