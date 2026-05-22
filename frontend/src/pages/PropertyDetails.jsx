import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import PropertyGallery from "../components/PropertyGallery";
import ReviewModal from "../components/ReviewModal";
import BookingPreviewModal from "../components/BookingModal";
import ProCalendar from "../components/ProCalendar.jsx";

import { MdFamilyRestroom, MdOutlineDoorBack } from "react-icons/md";
import { LuBath } from "react-icons/lu";
import { IoHome } from "react-icons/io5";

import { amenitiesData } from "../amenitiesData.js";
import { activitiesData } from "../activitiesData.js";
import InquiryModal from "../components/InquiryModal.jsx";
import DisplayCalendar from "../components/miniCalendar.jsx";
import PropertyminiCalendar from "../components/PropertyminiCalendar.jsx";

const PropertyDetail = () => {
  const { id } = useParams();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openReview, setOpenReview] = useState(false);
  const [openBooking, setOpenBooking] = useState(false);

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);

  const [blockedDates, setBlockedDates] = useState([]);
  const [openInquiry, setOpenInquiry] = useState(false);
  const [calendarData, setCalendarData] = useState([]);

  // ================= FETCH LISTING =================
  useEffect(() => {
    api
      .get(`/listings/${id}`)
      .then((res) => {
        setListing(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // ================= FETCH CALENDAR =================
  useEffect(() => {
    api.get(`/listings/${id}/calendar`).then((res) => {
      const blocked = res.data
        .filter((d) => d.status === "R" || d.status === "H")
        .map((d) => {
          const dt = new Date(d.date);
          dt.setHours(0, 0, 0, 0);
          return dt;
        });

      setBlockedDates(blocked);
    });
  }, [id]);
  const getMinNightsForDate = (date) => {
    if (!listing?.rates || !date) return 1;

    const selected = listing.rates.find((r) => {
      const from = new Date(r.from);
      const to = new Date(r.to);

      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);

      return date >= from && date <= to;
    });

    return selected?.minNights || 1;
  };

  // 🔹 useEffect
  useEffect(() => {
    if (checkIn && checkOut && listing) {
      const minNights = getMinNightsForDate(checkIn);

      const diff = (checkOut - checkIn) / (1000 * 60 * 60 * 24);

      if (diff < minNights) {
        const newDate = new Date(checkIn);
        newDate.setDate(newDate.getDate() + minNights);
        setCheckOut(newDate);
      }
    }
  }, [checkIn, checkOut, listing]);

  if (loading) return <p className="p-10">Loading...</p>;
  if (!listing) return <p className="p-10">Property not found</p>;

  // ================= IMAGES =================
    const imageUrls =
  listing.photos || [];

  // ================= REVIEWS =================
  const publishedReviews =
    listing.reviews?.filter((r) => r.published === true) || [];

  // ================= YOUTUBE =================
  const getYoutubeEmbed = (url) => {
    if (!url) return null;
    if (url.includes("embed")) return url;
    if (url.includes("watch?v=")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/"))
      return `https://www.youtube.com/embed/${url.split("youtu.be/")[1]}`;
    return null;
  };

  // ================= MAP =================
   const getMapEmbedUrl = (lat, lng) => {

  const finalLat = Number(lat);
  const finalLng = Number(lng);

  return `https://maps.google.com/maps?q=${finalLat},${finalLng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
};
  const formatDate = (date) => {
    if (!date) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ================= MIN NIGHT AUTO FIX =================
  // 🔹 single function

  return (
    <>
      {/* GALLERY */}
      <PropertyGallery images={imageUrls} />

      <div className="max-w-7xl mx-auto px-4 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10 mb-20">
        {/* LEFT */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg p-6 md:p-10">
          <p className="text-gray-500 text-sm mb-2">
            {listing.location?.address || "Location"}
          </p>

          <h1 className="text-4xl font-bold mb-4">{listing.property?.title}</h1>

          {/* ICONS */}
          <div className="flex gap-20 mb-6 flex-wrap">
            <div className="text-center">
              <MdFamilyRestroom className="text-3xl mx-auto" />
              <p>Sleeps {listing.property?.maxSleeps}</p>
            </div>

            <div className="text-center">
              <MdOutlineDoorBack className="text-3xl mx-auto" />
              <p>Bedrooms {listing.property?.bedrooms}</p>
            </div>

            <div className="text-center">
              <LuBath className="text-3xl mx-auto" />
              <p>Bathrooms {listing.property?.bathrooms}</p>
            </div>

            <div className="text-center">
              <IoHome className="text-3xl mx-auto" />
              <p>{listing.property?.category}</p>
            </div>
          </div>

          {/* DESCRIPTION */}
          <h2 className="text-2xl font-semibold mb-2">Description</h2>
          <div
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: listing.description }}
          />

          {/* AMENITIES */}
          <h2 className="text-2xl font-semibold mt-8 mb-4">Amenities</h2>
          {amenitiesData.map((section) => {
            const selected = section.options.filter(
              (item) => listing.amenities?.[item],
            );
            if (selected.length === 0) return null;

            return (
              <div key={section.title} className="mb-6">
                <h5 className="bg-[#2f9bad] text-white p-2 rounded-xl text-lg mb-2">
                  {section.title}
                </h5>

                <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 list-disc ml-6">
                  {selected.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            );
          })}
          {/* Activities */}
         
          {activitiesData.map((section) => {
            const selected = section.options.filter(
              (item) => listing.activities?.[item],
            );
            if (selected.length === 0) return null;

            return (
              
              <div key={section.title} className="mb-6">
                 <h2 className="text-2xl font-semibold mt-8 mb-4">Activities</h2>
                <h5 className="bg-[#2f9bad] text-white p-2 rounded-xl text-lg mb-2">
                  {section.title}
                </h5>

                <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 list-disc ml-6">
                  {selected.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* VIDEO */}
          {listing.video?.youtube && (
            <div className="mt-10">
              <h2 className="text-2xl font-semibold mb-4">Property Video</h2>
              <iframe
                src={getYoutubeEmbed(listing.video.youtube)}
                className="w-full h-80 rounded-xl border"
                allowFullScreen
                title="video"
              />
            </div>
          )}

          {/* MAP */}
                {listing?.location?.lat &&
 listing?.location?.lng && (

  <div className="mt-10">

    <h2 className="text-2xl font-semibold mb-4">
      Location
    </h2>

    <iframe
      src={getMapEmbedUrl(
        listing.location.lat,
        listing.location.lng
      )}

      className="w-full h-96 rounded-xl border"

      loading="lazy"

      allowFullScreen

      referrerPolicy="no-referrer-when-downgrade"

      title="Property Location"
    />

  </div>
)}

          {/* REVIEWS */}
          {publishedReviews.length > 0 && (
            <div className="mt-14">
              <h2 className="text-2xl font-semibold mb-6">
                Guest Reviews ({publishedReviews.length})
              </h2>

              {publishedReviews.map((review) => (
                <div key={review._id} className="mb-8">
                  <div className=" rounded-xl p-6 bg-gray-50">
                    {/* ⭐ RATING */}
                    <div className="text-yellow-500
  text-lg mb-2">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>

                    {/* TITLE */}
                    <h4 className="font-semibold text-lg">{review.title}</h4>

                    {/* MESSAGE */}
                    <p className="text-gray-700 mt-2">{review.message}</p>
                    <p className="text-gray-700 mt-2">-{review.name}</p>

                    {/* 🔥 ADMIN REPLY (ADD THIS) */}
                    {review.reply && (
                      <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                        <p className="text-sm font-semibold text-green-700 mb-1">
                          Owner Reply
                        </p>
                        <p className="text-gray-700 text-sm">{review.reply}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setOpenReview(true)}
            className="mt-6 bg-[#FFE8BE] text-black px-6 py-2 rounded"
          >
            Write a Review
          </button>
 
          {openReview && (
            <ReviewModal listingId={id} onClose={() => setOpenReview(false)} />
          )}
        </div> 

        {/* RIGHT BOOKING */}
        {/* CALENDAR */}

        <div className="lg:col-span-1">
          <div className="sticky top-[100px] bg-white rounded-3xl shadow-xl p-6 ">
           <PropertyminiCalendar listingId={listing._id} />
          </div>
        </div>
      </div>

      {/* BOOKING MODAL */}
      {/* {openBooking && (
        <BookingPreviewModal
          propertyId={id}
          checkIn={formatDate(checkIn)}
          checkOut={formatDate(checkOut)}
          onClose={() => setOpenBooking(false)}
        />
      )} */}
    </>
  );
};

export default PropertyDetail;
