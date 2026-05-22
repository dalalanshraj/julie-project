import { useEffect, useState } from "react";
import api from "../../api/axios";
import DisplayCalendar from "../miniCalendar";
import { Link } from "react-router-dom";

export default function AboutSection({ listingId }) {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

 const getImageUrl = (photo) => {
  const base =
    import.meta.env.VITE_API_URL || "";

  // new object format
  if (photo?.url) {
    if (photo.url.startsWith("http")) {
      return photo.url;
    }

    return (
      base.replace(/\/$/, "") +
      "/" +
      photo.url.replace(/^\//, "")
    );
  }

  // old string fallback
  if (typeof photo === "string") {
    if (photo.startsWith("http")) {
      return photo;
    }

    return (
      base.replace(/\/$/, "") +
      "/" +
      photo.replace(/^\//, "")
    );
  }

  return "https://via.placeholder.com/600x400";
};

  // ===========================
  // FETCH LISTING
  // ===========================
  useEffect(() => {
    if (!listingId) return;

    api
      .get(`/listings/${listingId}`)
      .then((res) => {
        setListing(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setLoading(false));
  }, [listingId]);

  // ===========================
  // LOADING UI
  // ===========================
  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">Loading property...</div>
    );
  }

  if (!listing) {
    return (
      <div className="py-20 text-center text-red-500">Property not found</div>
    );
  }

  // ===========================
  // 🔥 ACTIVE RATE LOGIC
  // ===========================
  const today = new Date();

  const activeRate = listing?.rates?.find((rate) => {
    const from = new Date(rate.from);
    const to = new Date(rate.to);
    return today >= from && today <= to;
  });

  const rate = activeRate || listing?.rates?.[0] || {};

  const nightly = rate?.nightly || "N/A";
  const minNights = rate?.minNights || 1;

  // ===========================
  // IMAGE
  // ===========================
  const image = getImageUrl(
  listing?.photos?.[0]
);

  return (
    <section className="w-full bg-[#f8f8f8] py-20 px-6 md:px-16">
      {/* ================= TOP ================= */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* RIGHT CALENDAR */}

      <DisplayCalendar listingId={listing._id} />
        {/* LEFT CONTENT */}
        <div>
          <p className="uppercase text-xs tracking-[3px] mx-1  text-[#2f9bad] mb-3">
            {listing?.property?.title || "Welcome"}
          </p>

          <h2 className="text-3xl md:text-5xl font-semibold text-gray-800">
            {listing?.property?.tagline ||
              "Luxury Coastal Getaway with Stunning Resort Views"}
          </h2>

          <p className="text-gray-600 text-base mt-2">
            {listing?.property?.summary ||
              "2BR/2BA • Pool • Lagoon Front"}
          </p>
         
          {/* <Link to={"/booking-policy"}>
            <button className="px-6 py-3 mt-3 bg-[#FFE8BE] text-black rounded-full font-semibold hover:scale-105 transition">
              Booking Policy
            </button>
          </Link> */}
        </div>

      
      </div>

      {/* ================= BOTTOM ================= */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-14 mt-20 items-center">

          {/* TEXT */}
        <div>
          <p className="uppercase text-xs tracking-[3px] text-[#2f9bad] mb-3">
            About us
          </p>
          <h3 className="text-3xl md:text-5xl font-semibold text-gray-800 mb-8">
            About this Property
          </h3>
          <p className="text-gray-600 leading-relaxed ">
           This beautiful beachfront condo in Panama City Beach offers the perfect mix of comfort, luxury, and relaxation. Located on the 4th floor of the West Tower, the condo features two spacious bedrooms with king beds, two private bathrooms, and a cozy Murphy bed for additional guests. Enjoy breathtaking ocean and sunset views from your private balcony while experiencing resort-style amenities including a tiki bar, fire pits, live music, and complimentary beach chairs with an umbrella. With a fully stocked kitchen, modern appliances, and direct beach access, this condo is the ideal destination for unforgettable family vacations, romantic escapes, or relaxing coastal getaways.
          </p>

          {/* <div
            className="text-gray-600 leading-relaxed mb-3"
          
            // dangerouslySetInnerHTML={{
            //   __html: listing?.description || "No description available",
            // }}
           
          /> */}
          <div className="p-3 flex mx-[-12px]">
             <span className="font-bold  uppercase">owner&nbsp; -
            &nbsp;</span><p className="text-[#2f9bad] ">Julie Shurden</p> 
          </div>

          <Link to={"/about"}>
            {" "}
            <button className="px-6 py-3 bg-[#FFE8BE] text-black rounded-full font-semibold hover:scale-105 transition">
              Know More →
            </button>
          </Link>
        </div>
        {/* IMAGE */}
        <div className="relative group overflow-hidden rounded-2xl">
          <img
            src={image}
            alt="property"
            className="w-full h-[280px] sm:h-[380px] md:h-[450px] object-cover transition duration-700 group-hover:scale-110"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/600x400";
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

          {/* <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium shadow">
            {listing?.property?.tag || "Premium Property"}
          </div> */}
        </div>

      
      </div>
    </section>
  );
}
