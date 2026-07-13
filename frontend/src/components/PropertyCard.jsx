import React from "react";
import { Link } from "react-router-dom";
import { BedDouble, Bath, MapPin } from "lucide-react";

const PropertyCard = ({ listing }) => {
  if (!listing) return null;

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

  return "https://via.placeholder.com/400x300?text=No+Image";
};

  const image = getImageUrl(
  listing?.photos?.[2]
);

  const originalPrice = listing?.rates?.[0]?.nightly || null;
  const dealPrice = listing?.deal?.discountedRate;

  return (
    <Link to={`/${listing?._id}`}>
      <div className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition duration-500">
        {/* IMAGE */}
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt="property"
            className="w-full h-[240px] object-cover transition duration-700 group-hover:scale-110"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/400x300?text=No+Image";
            }}
          />

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

          {/* DEAL BADGE */}
          {listing?.deal && (
            <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs px-3 py-1 rounded-full shadow">
              DEAL
            </div>
          )}

          {/* PRICE */}
          <div className="absolute bottom-4 left-4 text-white">
            {listing?.deal ? (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">
                  ${listing.deal.discountedRate}
                </span>
                <span className="line-through text-sm opacity-70">
                  ${originalPrice}
                </span>
              </div>
            ) : (
              <span className="text-xl font-semibold">
                {/* ${originalPrice || "Call"} */}
              </span>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-4">
          {/* TITLE */}
          <h3 className="text-lg font-semibold mb-1 group-hover:text-black transition">
            {listing?.property?.title || "Luxury Property"}
          </h3>

          {/* LOCATION */}
          <div className="flex items-center text-gray-500 text-sm mb-2 gap-1">
            <MapPin className="font-bold" color="green" size={18} />
            {listing?.location?.address || "Beach Area"}
          </div>

          {/* FEATURES */}
          <div className="flex items-center justify-between text-gray-600 text-sm mt-3">
            <div className="flex items-center gap-1">
              <BedDouble color="green" size={16} />
              <span>{listing?.property?.bedrooms || 3} Beds</span>
            </div>

            <div className="flex items-center gap-1">
              <Bath color="green" size={16} />
              <span>{listing?.property.bathrooms || 2} Baths</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
