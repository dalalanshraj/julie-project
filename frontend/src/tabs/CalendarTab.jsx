import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../api/axios";
import {
  useMemo,
  useCallback,
} from "react";

export default function CalendarTab({ listingId }) {
  const [blockedDates, setBlockedDates] = useState([]);

  const [icalUrl, setIcalUrl] = useState("");

  const [startDate, setStartDate] = useState(null);

  const [endDate, setEndDate] = useState(null);

  // =====================================
  // FETCH DATES
  // =====================================

  useEffect(() => {
    if (listingId) {
      fetchDates();
    }
  }, [listingId]);

  const fetchDates = () => {
    api
      .get(`/calendar/${listingId}/calendar`)

      .then((res) => {
        setBlockedDates(res.data.calendar || []);

        setIcalUrl(res.data.icalUrl || "");
      })

      .catch(console.log);
  };

  // =====================================
  // SAME DAY
  // =====================================

  const isSameDay = (d1, d2) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  // =====================================
  // BLOCKED
  // =====================================

  // const isBlocked = (date) => {
  //   return blockedDates.some((r) => {
  //     const s = new Date(
  //       new Date(r.start).getFullYear(),

  //       new Date(r.start).getMonth(),

  //       new Date(r.start).getDate(),
  //     );

  //     const e = new Date(
  //       new Date(r.end).getFullYear(),

  //       new Date(r.end).getMonth(),

  //       new Date(r.end).getDate(),
  //     );

  //     const current = new Date(
  //       date.getFullYear(),

  //       date.getMonth(),

  //       date.getDate(),
  //     );

  //     return current >= s && current < e;
  //   });
  // };

  // =====================================
  // DAY TYPE
  // =====================================
  const formatLocalDate = (date) => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(date));
  };
  const blockedMap = useMemo(() => {

  const map = {};

  blockedDates.forEach((item) => {

    const itemDate = new Date(
      new Date(item.date).toLocaleString(
        "en-US",
        {
          timeZone:
            "America/Chicago",
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

}, [blockedDates]);

  const getDateType = useCallback((date) => {

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const currentDate = new Date(date);

  currentDate.setHours(0, 0, 0, 0);

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

  if (hasCIN && hasCOUT) {
    return "turnover-day";
  }

  if (hasCIN) {
    return "checkin-day";
  }

  if (hasCOUT) {
    return "checkout-day";
  }

  if (hasR) {
    return "blocked-day";
  }

  if (hasH) {
    return "hold-day";
  }

  return "available-day";

}, [blockedMap]);
  // =====================================
  // MANUAL DATE SELECT
  // =====================================

  const handleDateSelect = (dates) => {
    const [start, end] = dates;

    setStartDate(start);

    setEndDate(end);
  };

  // =====================================
  // BLOCK DATES
  // =====================================

  const blockDates = async () => {
    if (!startDate || !endDate) {
      return alert("Select date range");
    }

    try {
      await api.post(`/calendar/${listingId}/calendar/block`, {
        start: startDate,

        end: endDate,
      });

      alert("Dates blocked");

      fetchDates();

      setStartDate(null);

      setEndDate(null);
    } catch (err) {
      console.log(err);

      alert("Block failed");
    }
  };

  // =====================================
  // UNBLOCK DATES
  // =====================================

  const unblockDates = async () => {
    if (!startDate || !endDate) {
      return alert("Select date range");
    }

    try {
      await api.post(`/calendar/${listingId}/calendar/unblock`, {
        start: startDate,

        end: endDate,
      });

      alert("Dates unblocked");

      fetchDates();

      setStartDate(null);

      setEndDate(null);
    } catch (err) {
      console.log(err);

      alert("Unblock failed");
    }
  };

  // =====================================
  // IMPORT ICAL
  // =====================================

  const importICal = async () => {
    if (!icalUrl.trim()) {
      return alert("Enter iCal URL");
    }

    try {
      await api.post(
        `/calendar/${listingId}/calendar/import-ical`,

        {
          url: icalUrl,
        },
      );

      alert("iCal imported successfully");

      fetchDates();
    } catch (err) {
      console.log(err);

      alert(err?.response?.data?.error || "iCal failed");
    }
  };
  const resetICal = async () => {
    try {
      await api.put(`/calendar/${listingId}/calendar/reset-ical`);

      alert("iCal reset successful");

      setIcalUrl("");

      fetchDates();
    } catch (err) {
      console.log(err);

      alert("Reset failed");
    }
  };
  return (
    <div className="w-full flex justify-center px-3 sm:px-6 py-10 bg-[#f8fafc]">
      {/* CARD */}
      <div
        className="
        w-full
        max-w-[900px]
        
        border border-gray-100
        rounded-3xl
        shadow-2xl
        p-4 sm:p-6
      "
      >
        {/* HEADER */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
            Availability Calendar
          </h2>

          <p className="text-center text-gray-500 text-sm mt-2">
            Manage bookings & imported calendars
          </p>
        </div>

        {/* ICAL SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 mb-6">
          <input
            type="text"
            value={icalUrl}
            onChange={(e) => setIcalUrl(e.target.value)}
            placeholder="Paste iCal URL"
            className="
            w-full
            border border-gray-200
            rounded-xl
            px-4 py-3
            text-sm
            outline-none
            focus:ring-4
            focus:ring-blue-100
            focus:border-blue-500
            transition-all
          "
          />

          <button
            onClick={importICal}
            className="
            
            
            px-5
            py-3
            bg-blue-600 text-white rounded cursor-pointer
          "
          >
            Import
          </button>

          <button
            onClick={resetICal}
            className="
            bg-red-500
            
            text-white
            px-5
            py-3
            rounded-xl
            
          "
          >
            Reset
          </button>
        </div>

        {/* CALENDAR */}
        <div
          className="
          w-full
          overflow-x-auto
          rounded-2xl
          border border-gray-100
          bg-white
          shadow-inner
          p-3
        "
        >
          <DatePicker
            inline
            monthsShown={2}
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateSelect}
            minDate={new Date()}
            dayClassName={getDateType}
            showOtherMonths={false}
            showPopperArrow={false}
            filterDate={(date) => {
              const today = new Date();

              today.setHours(0, 0, 0, 0);

              const current = new Date(date);

              current.setHours(0, 0, 0, 0);

              return current >= today;
            }}
          />
        </div>

        {/* BUTTONS */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            onClick={blockDates}
            className="
            bg-gradient-to-r
            from-red-500
            to-rose-500
            text-white
            py-3
            rounded-xl
            font-semibold
            shadow-lg
            hover:scale-[1.01]
            active:scale-[0.98]
            transition-all
          "
          >
            Block Dates
          </button>

          <button
            onClick={unblockDates}
            className="
            bg-gradient-to-r
            from-emerald-500
            to-green-500
            text-white
            py-3
            rounded-xl
            font-semibold
            shadow-lg
            hover:scale-[1.01]
            active:scale-[0.98]
            transition-all
          "
          >
            Unblock Dates
          </button>
        </div>

        {/* LEGEND */}
        <div
          className="
          grid
          grid-cols-2
          sm:grid-cols-4
          gap-3
          mt-7
          text-xs
          sm:text-sm
        "
        >
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#d1fae5]"></span>
            Available
          </div>

          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#5C5CFF]"></span>
            Booked
          </div>

          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded border"
              style={{
                background: "linear-gradient(135deg, #5C5CFF 50%, #d1fae5 50%)",
              }}
            ></span>
            Check-In
          </div>

          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded border"
              style={{
                background: "linear-gradient(315deg, #5C5CFF 50%, #d1fae5 50%)",
              }}
            ></span>
            Check-Out
          </div>
        </div>
      </div>

      {/* CSS */}
      <style>{`
.react-datepicker {
  width: 100% !important;
  border: none !important;
  font-family: inherit;
  background: transparent !important;
}.react-datepicker__month-container {
  padding: 40px;
} .react-datepicker__week { display: flex; justify-content: space-between; } .react-datepicker__day, .react-datepicker__day-name { width: 36px; height: 36px; line-height: 36px; margin: 2px; border-radius: 8px; } /* AVAILABLE */ .react-datepicker__day.available-day { background: #d1fae5 !important; color: black !important; } //* AVAILABLE */ .react-datepicker__day.available-day { background: #d1fae5 !important; color: black !important; } /* BOOKED */ .react-datepicker__day.blocked-day { background: #5C5CFF !important; color: white !important; } /* HOLD */ .react-datepicker__day.hold-day { background: #facc15 !important; color: black !important; } /* CHECK-IN */ .react-datepicker__day.checkin-day { background: linear-gradient( 135deg, #d1fae5 50%, #5C5CFF 50% ) !important; color: black !important; } /* CHECK-OUT */ .react-datepicker__day.checkout-day { background: linear-gradient( 315deg, #d1fae5 50%, #5C5CFF 50% ) !important; color: black !important; } /* TURNOVER */ .react-datepicker__day.turnover-day { position: relative !important; background: linear-gradient( 135deg, #d1fae5 50%, #5C5CFF 50% ) !important; color: black !important; overflow: hidden; } /* SMALL CENTER DIAGONAL */ .react-datepicker__day.turnover-day::after { content: ""; position: absolute; width: 160%; height: 2px; background: black; top: 50%; left: -30%; transform: rotate(-45deg); z-index: 5; } .react-datepicker__day--outside-month { visibility: hidden !important; pointer-events: none !important; } .react-datepicker__day.past-day { background: #d1fae5 !important; color: #94a3b8 !important; opacity: 0.7 !important; cursor: not-allowed !important; } }</style>

    `}</style>
    </div>
  );
}
