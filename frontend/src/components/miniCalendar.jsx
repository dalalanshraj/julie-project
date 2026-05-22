import { useEffect, useState , useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../api/axios";

export default function DisplayCalendar({ listingId }) {

  const [calendarDates, setCalendarDates] = useState([]);

  // =====================================
  // FETCH CALENDAR
  // =====================================

  useEffect(() => {

    if (listingId) {
      fetchDates();
    }

  }, [listingId]);

  const fetchDates = async () => {

    try {

      const res = await api.get(
        `/calendar/${listingId}/calendar`
      );

      setCalendarDates(
        res.data.calendar || []
      );

    } catch (err) {

      console.log(err);

    }

  };

  // =====================================
  // NORMALIZE DATE
  // =====================================

  // =====================================
// FORMAT DATE
// =====================================

const formatLocalDate = (date) => {

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(new Date(date));

};

// =====================================
// BLOCKED MAP
// =====================================

const blockedMap = useMemo(() => {

  const map = {};

  calendarDates.forEach((item) => {

    const itemDate = new Date(
      new Date(item.date).toLocaleString(
        "en-US",
        {
          timeZone: "America/Chicago",
        }
      )
    );

    const key =
      formatLocalDate(itemDate);

    if (!map[key]) {
      map[key] = [];
    }

    map[key].push(item.status);

  });

  return map;

}, [calendarDates]);

// =====================================
// DATE TYPE
// =====================================

const getDateType = (date) => {

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const currentDate = new Date(date);

  currentDate.setHours(0, 0, 0, 0);

  // PAST
  if (currentDate < today) {
    return "past-day";
  }

  const currentKey =
    formatLocalDate(currentDate);

  const statuses =
    blockedMap[currentKey] || [];

  const hasCIN =
    statuses.includes("CIN");

  const hasCOUT =
    statuses.includes("COUT");

  const hasR =
    statuses.includes("R");

  const hasH =
    statuses.includes("H");

  // =====================================
  // PREVIOUS DAY
  // =====================================

  const prevDay = new Date(currentDate);

  prevDay.setDate(
    prevDay.getDate() - 1
  );

  const prevKey =
    formatLocalDate(prevDay);

  const prevStatuses =
    blockedMap[prevKey] || [];

  const prevHasBooking =
    prevStatuses.includes("R") ||
    prevStatuses.includes("COUT");

  // =====================================
  // TURNOVER
  // =====================================

  if (hasCIN && hasCOUT) {
    return "turnover-day";
  }

  if (hasCIN && prevHasBooking) {
    return "turnover-day";
  }

  // CHECK-IN
  if (hasCIN) {
    return "checkin-day";
  }

  // CHECK-OUT
  if (hasCOUT) {
    return "checkout-day";
  }

  // BOOKED
  if (hasR) {
    return "blocked-day";
  }

  // HOLD
  if (hasH) {
    return "hold-day";
  }

  return "available-day";

};

  return (

    <div className="w-full flex justify-center px-1 sm:px-6 py-10">

      {/* CARD */}
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 p-2 md:p-15 sm:p-6">

        {/* TITLE */}
        <h2 className="text-lg sm:text-xl font-semibold text-center mb-5 tracking-wide">
          Availability Calendar
        </h2>

        {/* CALENDAR */}
        <DatePicker
          inline
          selected={null}
          onChange={() => {}}
          minDate={new Date()}
          dayClassName={getDateType}
          fixedHeight
          showPopperArrow={false}
          showOtherMonths={false}
          filterDate={(date) => {

            const today = new Date();

            today.setHours(0, 0, 0, 0);

            const current = new Date(date);

            current.setHours(0, 0, 0, 0);

            return current >= today;

          }}
        />

        {/* LEGEND */}
        <div className="flex justify-center gap-4 mt-6 text-xs flex-wrap">

          {/* AVAILABLE */}
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-[#d1fae5] rounded"></span>
            Available
          </div>

          {/* BOOKED */}
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-[#5C5CFF] rounded"></span>
            Booked
          </div>

          {/* CHECK-IN */}
          <div className="flex items-center gap-1">
            <span
              className="w-4 h-4 rounded border"
              style={{
                background:
                  "linear-gradient(135deg, #5C5CFF 50%, #d1fae5 50%)",
              }}
            ></span>
            Check-Out
          </div>

          {/* CHECK-OUT */}
          <div className="flex items-center gap-1">
            <span
              className="w-4 h-4 rounded border"
              style={{
                background:
                  "linear-gradient(315deg, #5C5CFF 50%, #d1fae5 50%)",
              }}
            ></span>
            Check-In
          </div>

          {/* TURNOVER */}
          <div className="flex items-center gap-2">
          <span className="relative w-4 h-4 rounded bg-[#5C5CFF] overflow-hidden">
            <span
              className="absolute w-[140%] h-[2px] bg-black top-1/2 left-[-20%] rotate-135"
            ></span>
          </span>
          Turnover
        </div>

          {/* HOLD */}
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-yellow-400 rounded"></span>
            Hold
          </div>

        </div>

        <p className="mt-4 text-center text-sm">
          <span className="text-[#2f9bad]">
            Check-in :
          </span>{" "}
          4:00 PM /{" "}
          <span className="text-[#2f9bad]">
            Check-out:
          </span>{" "}
          10:00 AM
        </p>

      </div>

      {/* CSS */}
      <style>{`

/* MAIN */
.react-datepicker {
  width: 100% !important;
  overflow: hidden;
  position: relative;
  max-width: 320px;
  margin: auto;
  border: none;
  font-family: inherit;
}

/* HEADER */
.react-datepicker__header {
  background: transparent;
  border-bottom: none;
}

/* MONTH */
.react-datepicker__current-month {
  font-weight: 600;
  margin-bottom: 10px;
}

/* WEEK */
.react-datepicker__week {
  display: flex;
  justify-content: space-between;
}

/* DAY */
.react-datepicker__day,
.react-datepicker__day-name {
  width: 36px;
  height: 36px;
  line-height: 36px;
  margin: 2px;
  border-radius: 8px;
  position: relative;
}

/* MOBILE */
@media (max-width: 400px) {

  .react-datepicker__day,
  .react-datepicker__day-name {

    width: 30px;
    height: 30px;
    line-height: 30px;
    font-size: 12px;

  }

}

/* DESKTOP */
@media (min-width: 768px) {

  .react-datepicker__day,
  .react-datepicker__day-name {

    width: 40px;
    height: 40px;
    line-height: 40px;

  }

}

/* PAST */
.react-datepicker__day.past-day {

  background: #f1f1f1 !important;
  color: #aaa !important;
  opacity: 0.7 !important;

}

/* AVAILABLE */
.react-datepicker__day.available-day {

  background: #d1fae5 !important;
  color: black !important;

}

/* BOOKED */
.react-datepicker__day.blocked-day {

  background: #5C5CFF !important;
  color: white !important;

}

/* HOLD */
.react-datepicker__day.hold-day {

  background: #facc15 !important;
  color: black !important;

}

/* CHECK-IN */
.react-datepicker__day.checkin-day {

  background: linear-gradient(
    135deg,
    #d1fae5 50%,
    #5C5CFF 50%
  ) !important;

  color: black !important;
}

/* CHECK-OUT */
.react-datepicker__day.checkout-day {

  background: linear-gradient(
    315deg,
    #d1fae5 50%,
    #5C5CFF 50%
  ) !important;

  color: black !important;
}

/* TURNOVER */
.react-datepicker__day.turnover-day {

  position: relative !important;

  background: linear-gradient(
    315deg,
    #5C5CFF 50%,
    #5C5CFF 50%
  ) !important;

  color: black !important;

  overflow: hidden;
}

.react-datepicker__day.turnover-day::after {

  content: "";

  position: absolute;

  width: 160%;
  height: 2px;

  background: black;

  top: 50%;
  left: -30%;

  transform: rotate(-45deg);

  z-index: 5;
}
/* OUTSIDE DAYS */
.react-datepicker__day--outside-month {

  visibility: hidden !important;
  pointer-events: none !important;

}

      `}</style>

    </div>

  );

}