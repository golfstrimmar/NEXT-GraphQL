"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./Calendar.module.scss";
import ModalMessage from "@/components/ModalMessage/ModalMessage";

interface CalendarProps {
  selectedDate: Date | null;
  handleDateChange: (date: Date) => void;
}

const weekdays: string[] = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const months: string[] = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  handleDateChange,
}) => {
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | null>(
    selectedDate
  );
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    const dateToUse = selectedDate ?? new Date();
    if (
      dateToUse.getFullYear() === currentDate.getFullYear() &&
      dateToUse.getMonth() === currentDate.getMonth()
    ) {
      setSelectedDay(dateToUse.getDate());
    } else {
      setSelectedDay(null); // Сброс, если месяц другой
    }
  }, [selectedDate, currentDate]);

  const validateAndSetDate = (date: Date) => {
    const now = new Date().toLocaleString("de-DE", {
      timeZone: "Europe/Berlin",
    });
    const selected = new Date(
      date.toLocaleString("de-DE", { timeZone: "Europe/Berlin" })
    );
    selected.setHours(0, 0, 0, 0);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    if (selected < today) {
      setSuccessMessage("Date must be in the future!");
      setOpenModalMessage(true);
      const newDate = new Date(today);
      setInternalSelectedDate(newDate);
      setTimeout(() => {
        setSuccessMessage("");
        setOpenModalMessage(false);
      }, 2000);
      handleDateChange(newDate);
    } else {
      // setInternalSelectedDate(date);
      // handleDateChange(date);
      if (date) {
        handleDateChange(date);
      }
    }
  };

  const getDaysInMonth = (date: Date): (number | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    const days: (number | null)[] = [];

    const firstDayOfMonth =
      startOfMonth.getDay() === 0 ? 6 : startOfMonth.getDay() - 1;

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    for (let i = 1; i <= endOfMonth.getDate(); i++) {
      days.push(i);
    }

    return days;
  };

  const handleDayClick = (day: number | null) => {
    if (day) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const newDate = new Date(year, month, day);
      validateAndSetDate(newDate);
      setSelectedDay(day);
    }
  };

  const handleMonthChange = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleYearChange = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(currentDate.getFullYear() + direction);
    setCurrentDate(newDate);
  };

  const daysInMonth = getDaysInMonth(currentDate);

  return (
    <>
      <ModalMessage message={successMessage} open={openModalMessage} />

      {/* {selectedDate && <p>selectedDate:{selectedDate}</p>} */}
      <div className={`${styles["calendar"]} ${styles["rel"]}`}>
        <div className={`${styles["calendar-header"]}`}>
          <button
            type="button"
            className={`${styles["arrow-btn"]} ${styles["prev-year"]}`}
            onClick={() => handleYearChange(-1)}
          >
            &lt;&lt;
          </button>
          <button
            type="button"
            className={`${styles["arrow-btn"]} ${styles["prev-month"]}`}
            onClick={() => handleMonthChange(-1)}
          >
            &lt;
          </button>
          <span>
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            type="button"
            className={`${styles["arrow-btn"]} ${styles["next-month"]}`}
            onClick={() => handleMonthChange(1)}
          >
            &gt;
          </button>
          <button
            type="button"
            className={`${styles["arrow-btn"]} ${styles["next-year"]}`}
            onClick={() => handleYearChange(1)}
          >
            &gt;&gt;
          </button>
        </div>
        <div className={`${styles["calendar-grid"]}`}>
          {weekdays.map((day, index) => (
            <div key={index} className={`${styles["calendar-day"]}`}>
              {day}
            </div>
          ))}
          {daysInMonth.map((day, index) => (
            <div
              key={index}
              className={`${styles["calendar-day"]} ${
                day && day === selectedDay ? styles["selected"] : ""
              }`}
              onClick={() => handleDayClick(day)}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Calendar;
