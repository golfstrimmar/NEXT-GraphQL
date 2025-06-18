"use client";
import React, { useState, useEffect } from "react";
import styles from "./ClockUhr.module.scss";

interface InputProps {
  data: string;
  value: string;
  disabled?: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

const ClockUhr: React.FC<InputProps> = ({ value, onChange, disabled }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  // Объявляем getClosestMinute перед useState
  const getClosestMinute = (min: number) => {
    return minutes.reduce((prev, curr) =>
      Math.abs(curr - min) < Math.abs(prev - min) ? curr : prev
    );
  };

  const [hour, setHour] = useState<string>(
    value ? value.split(":")[0].padStart(2, "0") : "00"
  );
  const [minute, setMinute] = useState<string>(() => {
    const minValue = value ? Number(value.split(":")[1]) : 0;
    return getClosestMinute(minValue).toString().padStart(2, "0");
  });
  const [time, setTime] = useState<string>(value || "00:00");

  useEffect(() => {
    console.log("==value ClockUhr==", value);
    const cleanedValue = value ? value.trim() : "00:00";
    setTime(cleanedValue);
    setHour(cleanedValue ? cleanedValue.split(":")[0].padStart(2, "0") : "00");
    setMinute(() => {
      const minValue = cleanedValue ? Number(cleanedValue.split(":")[1]) : 0;
      return getClosestMinute(minValue).toString().padStart(2, "0");
    });
  }, [value]);

  const getPosition = (index: number, total: number, radius: number) => {
    const angle = (index / total) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    const x = radius * Math.cos(rad);
    const y = radius * Math.sin(rad);
    return { x, y };
  };

  const handleTimeClick = (hour: number, minute: number) => {
    if (disabled) return;
    const newHour = Math.floor(hour).toString().padStart(2, "0"); // Гарантируем число
    const newMinute = Math.floor(minute).toString().padStart(2, "0"); // Гарантируем число
    const newtime = `${newHour}:${newMinute}`;
    console.log("<====newtime====>", { newtime, hour, minute });
    const syntheticEvent = {
      target: { value: newtime },
    } as React.ChangeEvent<HTMLInputElement>;
    setHour(newHour);
    setMinute(newMinute);
    setTime(newtime);
    onChange(syntheticEvent);
  };

  return (
    <div className={`clock-uhr ${disabled ? "opacity-30" : ""}`}>
      <div className={styles["clock-picker"]}>
        <div className={styles["clock-face"]}>
          <div className={styles["clock-face-display"]}>
            <div
              className={`${styles["time-display"]} ${styles["time-display-hour"]}`}
            >
              {time ? time.split(":")[0] : "00"}
            </div>
            <span>:</span>
            <div className={`${styles["time-display"]}`}>
              {time ? time.split(":")[1] : "00"}
            </div>
          </div>
          {hours.map((h) => {
            const { x, y } = getPosition(h, 24, 80);
            return (
              <div
                key={h}
                className={`${styles.hour} ${
                  h.toString().padStart(2, "0") === hour ? styles.selected : ""
                }`}
                style={{
                  left: `calc(50% + ${Math.round(x * 1.4)}px)`,
                  top: `calc(50% + ${Math.round(y * 1.4)}px)`,
                  transform: "translate(-50%, -50%)",
                }}
                onMouseEnter={() => handleTimeClick(h, Number(minute))}
              >
                {h}
              </div>
            );
          })}
        </div>
        <div className={styles["minutes-face"]}>
          <div className={styles["clock-face-display"]}>
            <div className={`${styles["time-display"]}`}>
              {time ? time.split(":")[0] : "00"}
            </div>
            <span>:</span>
            <div
              className={`${styles["time-display"]} ${styles["time-display-hour"]}`}
            >
              {time ? time.split(":")[1] : "00"}
            </div>
          </div>
          {minutes.map((m) => {
            const { x, y } = getPosition(m / 5, 12, 80);
            return (
              <div
                key={m}
                className={`${styles.minute} ${
                  m.toString().padStart(2, "0") === minute
                    ? styles.selected
                    : ""
                }`}
                style={{
                  left: `calc(50% + ${Math.round(x)}px)`,
                  top: `calc(50% + ${Math.round(y)}px)`,
                  transform: "translate(-50%, -50%)",
                }}
                onMouseEnter={() => handleTimeClick(Number(hour), m)}
              >
                {m}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClockUhr;
