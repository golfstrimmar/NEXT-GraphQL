import { useState, useEffect } from "react";
import Calendar from "@/components/ui/Calendar/Calendar";
import ClockUhr from "@/components/ui/ClockUhr/ClockUhr";
import "./book.scss";
import Button from "../Button/Button";

interface CalendarProps {
  setErrors: (error: string) => void;
  setDate: (date: string) => void;
  closeCalendar: () => void;
  minDate: Date;
  flag: "in" | "out";
  initialDate: Date;
}

interface ClockUhrProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Book: React.FC = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const [checkIn, setCheckIn] = useState<Date>(new Date());
  const [checkOut, setCheckOut] = useState<string>(tomorrow);
  const [checkInTime, setCheckInTime] = useState<string>("00:00");
  const [checkOutTime, setCheckOutTime] = useState<string>("00:00");
  const [guests, setGuests] = useState<number>(0);
  const [errors, setErrors] = useState<string>("");
  const [openCalendarIn, setOpenCalendarIn] = useState<boolean>(false);
  const [openCalendarOut, setOpenCalendarOut] = useState<boolean>(false);

  const parseDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !checkIn ||
      !checkOut ||
      !checkInTime ||
      !checkOutTime ||
      guests === 0
    ) {
      setErrors("Please fill out all fields.");
      setTimeout(() => {
        setErrors("");
      }, 2000);
      return;
    }

    const params = new URLSearchParams({
      checkin: parseDate(checkIn),
      checkin_time: checkInTime,
      checkout: parseDate(checkOut),
      checkout_time: checkOutTime,
      guests: guests.toString(),
    });

    window.history.pushState(null, "", `?${params.toString()}`);

    setCheckIn(today);
    setCheckOut(tomorrow);
    setCheckInTime("00:00");
    setCheckOutTime("00:00");
    setGuests(0);
    setOpenCalendarIn(false);
    setOpenCalendarOut(false);
  };

  useEffect(() => {
    if (errors !== "") {
      setTimeout(() => {
        setErrors("");
      }, 1500);
    }
  }, [errors, openCalendarIn, openCalendarOut, checkIn, checkOut]);

  const handleDateChangeIn = (date: Date) => {
    if (date) {
      setCheckIn(date);
    }
  };
  const handleDateChangeOut = (date: Date) => {
    if (date) {
      setCheckOut(date);
    }
  };

  useEffect(() => {
    if (checkIn && checkOut) {
      if (checkIn < today) {
        setCheckIn(today);
        setErrors("Check-in date cannot be in the past.");
        setTimeout(() => {
          setErrors("");
        }, 1000);
      }
      if (checkIn >= checkOut) {
        const today = new Date(checkIn);
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        setCheckOut(tomorrow);
      }
    }
  }, [checkIn, checkOut]);

  return (
    <div className="book">
      <div className="container">
        {errors && <h3 className="errors center">{errors}</h3>}

        <div className="book__wrap">
          <h2>Booking</h2>
          <form className="book__date" onSubmit={handleSubmit}>
            {/* Check-in */}
            <div
              className="book__section relative"
              onClick={() => {
                setOpenCalendarIn((prev) => !prev);
                setOpenCalendarOut(false);
              }}
            >
              <div className="input-field">
                <input
                  id="In"
                  type="text"
                  name="checkin"
                  value={parseDate(checkIn) + `  ${checkInTime}`}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCheckIn(e.target.value)
                  }
                  placeholder="Check-in date and time"
                  readOnly
                />
                <label className="text-field__label" htmlFor="In">
                  Check-in
                </label>
              </div>

              {openCalendarIn && (
                <div className="book-calendar">
                  <Calendar
                    selectedDate={checkIn}
                    handleDateChange={handleDateChangeIn}
                  />
                  <ClockUhr
                    value={checkInTime}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCheckInTime(e.target.value)
                    }
                  />
                </div>
              )}
            </div>

            {/* Check-out */}
            <div
              className="book__section"
              onClick={() => {
                setOpenCalendarIn(false);
                setOpenCalendarOut((prev) => !prev);
              }}
            >
              <div className="input-field">
                <input
                  id="Out"
                  type="text"
                  name="checkout"
                  value={parseDate(checkOut) + ` ${checkOutTime}`}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCheckOut(e.target.value)
                  }
                  placeholder="Check-out date and time"
                  readOnly
                />
                <label className="text-field__label" htmlFor="Out">
                  Check-out
                </label>
              </div>
              {openCalendarOut && (
                <div className="calendar">
                  <div className="book-calendar">
                    <Calendar
                      selectedDate={checkOut}
                      handleDateChange={handleDateChangeOut}
                    />
                    <ClockUhr
                      value={checkOutTime}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCheckOutTime(e.target.value)
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Guests */}
            <div
              className="book__section"
              onClick={() => {
                setOpenCalendarIn(false);
                setOpenCalendarOut(false);
              }}
            >
              <div className="input-field">
                <input
                  id="Guests"
                  type="number"
                  name="guests"
                  value={guests}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setGuests(Number(e.target.value))
                  }
                  placeholder="Number of guests"
                  min="0"
                />
                <label className="text-field__label" htmlFor="Guests">
                  Guests
                </label>
              </div>
            </div>

            <Button buttonType="submit" buttonText="Search" />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Book;
