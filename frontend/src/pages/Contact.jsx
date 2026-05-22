import { useEffect, useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../api/axios";
import { IoLocation } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import emailjs from "@emailjs/browser";
import { useNavigate } from "react-router-dom";

export default function Contact({ listingId }) {

  const [listing, setListing] = useState(null);

  const [blockedDates, setBlockedDates] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] =
  useState(false);

  const [selecting, setSelecting] =
    useState("checkIn");

  const [images, setImages] =
    useState([]);

  const [status, setStatus] =
    useState({
      type: "",
      message: "",
    });

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      phone: "",
      adults: "",
      kids: "",
      checkIn: null,
      checkOut: null,
      message: "",
    });

  

  // =====================================
  // FETCH BLOCKED DATES
  // =====================================

  useEffect(() => {

    api
      .get("/calendar/blocked")
      .then((res) =>
        setBlockedDates(res.data)
      )
      .catch(console.log);

  }, []);

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

    blockedDates.forEach((booking) => {

      const start =
        new Date(booking.start);

      const end =
        new Date(booking.end);

      start.setHours(
        0,
        0,
        0,
        0
      );

      end.setHours(
        0,
        0,
        0,
        0
      );

      // CHECK-IN
      const startKey =
        formatLocalDate(start);

      if (!map[startKey]) {
        map[startKey] = [];
      }

      map[startKey].push("CIN");

      // CHECK-OUT
      const endKey =
        formatLocalDate(end);

      if (!map[endKey]) {
        map[endKey] = [];
      }

      map[endKey].push("COUT");

      // BOOKED
      const temp =
        new Date(start);

      temp.setDate(
        temp.getDate() + 1
      );

      while (temp < end) {

        const bookedKey =
          formatLocalDate(temp);

        if (!map[bookedKey]) {
          map[bookedKey] = [];
        }

        map[bookedKey].push("R");

        temp.setDate(
          temp.getDate() + 1
        );

      }

    });

    return map;

  }, [blockedDates]);

  // =====================================
  // DATE TYPE
  // =====================================

  const getDateType = (date) => {

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const currentDate =
      new Date(date);

    currentDate.setHours(
      0,
      0,
      0,
      0
    );

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

    // =====================================
    // PREVIOUS DAY
    // =====================================

    const prevDay =
      new Date(currentDate);

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

    if (
      hasCIN &&
      prevHasBooking
    ) {
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

    return "available-day";

  };

  // =====================================
  // BLOCK CHECK
  // =====================================

  const isBlocked = (date) => {

    const key =
      formatLocalDate(date);

    const statuses =
      blockedMap[key] || [];

    return (
      statuses.includes("R")
    );

  };

  // =====================================
  // STATUS AUTO CLEAR
  // =====================================

  useEffect(() => {

    if (!status.message) return;

    const timer =
      setTimeout(() => {

        setStatus({
          type: "",
          message: "",
        });

      }, 4000);

    return () =>
      clearTimeout(timer);

  }, [status]);

  // =====================================
  // SUBMIT
  // =====================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (
      !form.name ||
      !form.email ||
      !form.phone
    ) {
      alert(
        "Please fill all details ⚠️"
      );
      return;
    }

    if (
      !form.checkIn ||
      !form.checkOut
    ) {
      alert(
        "Please select dates 📅"
      );
      return;
    }

    try {

      setLoading(true);

      const PROPERTY_ID =
        "6a04c24a43652c16fdde1a52";

      const dbPayload = {
        property: PROPERTY_ID,
        name: form.name,
        email: form.email,
        phone: form.phone,
        message:
          form.message || "",

        Arrival:
          form.checkIn,

        Departure:
          form.checkOut,

        Adults:
          form.adults,

        Kids:
          form.kids,
      };

      await api.post(
        "/inquiries",
        dbPayload
      );

      const emailPayload = {
        name: form.name,
        email: form.email,
        phone: form.phone,

        checkIn:
          form.checkIn.toDateString(),

        checkOut:
          form.checkOut.toDateString(),

        adults:
          form.adults,

        kids:
          form.kids,

        message:
          form.message,
      };

      await emailjs.send(
        "service_ha362e7",
        "template_m1386o8",
        emailPayload,
        "gQXjMX4s-FM9aYRt5",
      );

      setStatus({
        type: "success",
        message:
          "Booking request sent successfully ✅",
      });

      setForm({
        name: "",
        email: "",
        phone: "",
        adults: "1",
        kids: "0",
        checkIn: null,
        checkOut: null,
        message: "",
      });
      setTimeout(() => {

  navigate("/");

}, 1500);

    } catch (err) {

      console.log(
        "ERROR:",
        err.response?.data || err
      );

      setStatus({
        type: "error",
        message:
          err.response?.data?.error ||
          "Something went wrong ❌",
      });
      

    } finally {

      setLoading(false);

    }

  };

  // =====================================
  // NIGHTS
  // =====================================

  const nights =
    form.checkIn &&
    form.checkOut
      ? Math.ceil(
          (
            form.checkOut -
            form.checkIn
          ) /
            (
              1000 *
              60 *
              60 *
              24
            )
        )
      : 0;

  // =====================================
  // FETCH LISTING
  // =====================================

  useEffect(() => {

    api
      .get(
        `/listings/${listingId}`
      )
      .then((res) => {

        setListing(res.data);

      })
      .catch(console.log);

  }, [listingId]);

  const getImageUrl = (path) => {

    if (
      !path ||
      typeof path !== "string"
    ) {
      return "";
    }

    const base =
      import.meta.env.VITE_API_URL ||
      "";

    if (
      path.startsWith("http")
    ) {
      return path;
    }

    return (
      base.replace(/\/$/, "") +
      "/" +
      path.replace(/^\//, "")
    );

  };

  const image =
    listing?.photos?.length > 0
      ? getImageUrl(
          listing.photos[0]
        )
      : "https://via.placeholder.com/600x400";

  const image1 =
    images[0] ||
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511";

  const heroImage =
    images[1] || image1;

  return (
    <>
      {/* HERO */}
      <section className="relative h-[50vh] flex items-center justify-center text-white">

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              `url(${heroImage})`,
          }}
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative text-center px-6">

          <h1 className="text-3xl md:text-5xl font-semibold mb-4">
            Contact & Booking
          </h1>

        </div>

      </section>

      {/* SECTION */}
      <section className="py-10 md:py-16 px-4 sm:px-6 md:px-16 bg-white">

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-start">

          {/* LEFT */}
          <div className="w-full">

            <h2 className="text-3xl md:text-5xl font-semibold text-gray-800">
              Get in Touch
            </h2>

            <p className="text-gray-600 mb-6 text-center md:text-left">
              Plan your stay with live availability calendar.
            </p>

            {/* CONTACT */}
            <div className="space-y-4 text-gray-700 mb-6">

              <div className="flex items-center gap-3 justify-center md:justify-start">

                <IoLocation
                  size={20}
                  className="text-red-500"
                />

                <p className="text-sm md:text-base">

                  {listing?.location?.address1 ||
                    listing?.property?.address ||
                    "Calypso 401 West"}

                </p>

              </div>

              <div className="flex items-center gap-3 justify-center md:justify-start">

                <MdEmail
                  size={20}
                  className="text-green-500"
                />

                <p className="text-sm md:text-base break-all">

                  {listing?.property?.altEmail ||
                    "Email not available"}

                </p>

              </div>

              <div className="flex items-center gap-3 justify-center md:justify-start">

                <FaPhoneAlt
                  size={18}
                  className="text-gray-800"
                />

                <p className="text-sm md:text-base">

                  {listing?.property?.altPhone ||
                    "Phone not available"}

                </p>

              </div>

            </div>

            {/* MAP */}
            <div className="rounded-2xl overflow-hidden shadow-md w-full">

              <iframe
                className="w-full h-[250px] md:h-[350px]"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d911.3272196319251!2d-85.87424523038668!3d30.21483089842738!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88938c41503baa51%3A0x21a40f55ed13dc05!2s15902%20FL-30%2C%20Panama%20City%20Beach%2C%20FL%2032413%2C%20USA!5e1!3m2!1sen!2sin!4v1778705995783!5m2!1sen!2sin"
                width="600"
                height="450"
              ></iframe>

            </div>

          </div>

          {/* RIGHT */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            <input
              placeholder="Name"
              className="w-full border p-3 rounded-lg"
              onChange={(e) =>
                setForm({
                  ...form,
                  name:
                    e.target.value,
                })
              }
            />

            <input
              placeholder="Email"
              className="w-full border p-3 rounded-lg"
              onChange={(e) =>
                setForm({
                  ...form,
                  email:
                    e.target.value,
                })
              }
            />

            <input
              placeholder="Phone"
              className="w-full border p-3 rounded-lg"
              onChange={(e) =>
                setForm({
                  ...form,
                  phone:
                    e.target.value,
                })
              }
            />

            {/* GUESTS */}
            <div className="flex gap-3">

              <div className="w-full">

                <label className="text-sm text-gray-500">
                  Adults
                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    form.adults
                  }
                  className="w-full border p-3 rounded-lg"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      adults:
                        Number(
                          e.target
                            .value
                        ),
                    })
                  }
                />

              </div>

              <div className="w-full">

                <label className="text-sm text-gray-500">
                  Kids
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.kids}
                  className="w-full border p-3 rounded-lg"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      kids:
                        Number(
                          e.target
                            .value
                        ),
                    })
                  }
                />

              </div>

            </div>

            {/* DATE BOXES */}
            <div className="flex gap-3">

              <div
                onClick={() =>
                  setSelecting(
                    "checkIn"
                  )
                }
                className="w-full p-3 border rounded-lg text-center cursor-pointer"
              >

                {form.checkIn
                  ? form.checkIn.toDateString()
                  : "Check-in"}

              </div>

              <div
                onClick={() =>
                  setSelecting(
                    "checkOut"
                  )
                }
                className="w-full p-3 border rounded-lg text-center cursor-pointer"
              >

                {form.checkOut
                  ? form.checkOut.toDateString()
                  : "Check-out"}

              </div>

            </div>

            {/* CALENDAR */}
            <div className="border rounded-xl p-2">

              <DatePicker
                inline
                selectsRange
                startDate={
                  form.checkIn
                }
                endDate={
                  form.checkOut
                }
                onChange={(dates) => {

                  const [
                    start,
                    end,
                  ] = dates;

                  if (
                    selecting ===
                    "checkIn"
                  ) {

                    setForm({
                      ...form,
                      checkIn:
                        start,
                      checkOut:
                        null,
                    });

                    setSelecting(
                      "checkOut"
                    );

                  } else {

                    setForm({
                      ...form,
                      checkIn:
                        form.checkIn,
                      checkOut:
                        end,
                    });

                  }

                }}
                minDate={
                  new Date()
                }
                dayClassName={
                  getDateType
                }
                showOtherMonths={
                  false
                }
                fixedHeight
                filterDate={(
                  date
                ) => {

                  const today =
                    new Date();

                  today.setHours(
                    0,
                    0,
                    0,
                    0
                  );

                  const current =
                    new Date(
                      date
                    );

                  current.setHours(
                    0,
                    0,
                    0,
                    0
                  );

                  return (
                    current >=
                      today &&
                    !isBlocked(
                      date
                    )
                  );

                }}
              />

            </div>

            <textarea
              placeholder="Your Message"
              className="w-full border p-3 rounded-lg"
              onChange={(e) =>
                setForm({
                  ...form,
                  message:
                    e.target.value,
                })
              }
            />

            {nights > 0 && (
              <p className="text-sm text-gray-600">
                {nights} nights
                selected
              </p>
            )}

            <p className="text-sm mt-2 text-black">
              Cleaning Fee - $135  (Mandatory)
            </p>

            <button
              disabled={loading}
              className="w-full bg-[#FFE8BE] py-3 rounded-lg"
            >

              {loading
                ? "Sending..."
                : "Send Booking"}

            </button>

          </form>

        </div>

      </section>

      {/* STYLES */}
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

  isolation: isolate;

  overflow: hidden !important;

  color: black !important;

  z-index: 10 !important;
}

.react-datepicker__day.turnover-day::before {

  content: "";

  position: absolute;

  inset: 0;

  border-radius: 8px;

  background: linear-gradient(
    to bottom right,
    #5C5CFF 0%,
    #5C5CFF 49%,
    #5C5CFF 51%,
    #5C5CFF 100%
  );

  z-index: -1;
}

.react-datepicker__day.turnover-day::after {

  content: "";

  position: absolute;

  width: 180%;

  height: 3px;

  background: black;

  top: 50%;

  left: -40%;

  transform: rotate(-45deg);

  z-index: 20;
}

/* OUTSIDE */
.react-datepicker__day--outside-month {

  visibility: hidden !important;

  pointer-events: none !important;

}

      `}</style>
    </>
  );

}