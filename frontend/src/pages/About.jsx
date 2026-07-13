import { useEffect, useState } from "react";
import api from "../api/axios";
import AboutSection from "../components/homeSection/About";
import { Link } from "react-router-dom";

export default function About({ listingId }) {
  const [images, setImages] = useState([]);
  const [listing, setListing] = useState(null);

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

  useEffect(() => {
    api
      .get("/gallery/published")
      .then((res) => {
        const data = res.data || [];

        const formatted = data.map((img) => getImageUrl(img.image));

        setImages(formatted);
      })
      .catch(console.log);
  }, []);

  const image =
    listing?.photos?.length > 0
      ? getImageUrl(listing.photos[0])
      : "https://via.placeholder.com/600x400";

  // 👉 fallback images (important)
  const image1 =
    images[0] || "https://images.unsplash.com/photo-1505691938895-1758d7feb511";

  const image2 =
    images[1] || "https://images.unsplash.com/photo-1560185007-cde436f6a4d0";

  const image3 = images[4];

  const heroImage = images[2] || image1;

  return (
    <>
      {/* 🔥 HERO */}
      <section className="relative h-[50vh] flex items-center justify-center text-white">
        <div
          className="absolute inset-0 bg-fixed bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative text-center px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">About Us</h1>
          <p className="text-gray-200 max-w-xl mx-auto">
            Discover comfort, luxury, and unforgettable stays with us.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-14 mt-20 items-center py-20 px-6 md:px-16">
        {/* TEXT */}
        <div>
          <p className="uppercase text-xs tracking-[3px] text-[#2f9bad] mb-3">
            About us
          </p>
          <h3 className="text-3xl md:text-5xl font-semibold text-gray-800 mb-8">
            About this Property
          </h3>
          <p className="text-gray-600 leading-relaxed ">
            This beautiful beachfront condo in Panama City Beach offers the
            perfect mix of comfort, luxury, and relaxation. Located on the 4th
            floor of the West Tower, the condo features two spacious bedrooms
            with king beds, two private bathrooms, and a cozy Murphy bed for
            additional guests. Enjoy breathtaking ocean and sunset views from
            your private balcony while experiencing resort-style amenities
            including a tiki bar, fire pits, live music, and complimentary beach
            chairs with an umbrella. With a fully stocked kitchen, modern
            appliances, and direct beach access, this condo is the ideal
            destination for unforgettable family vacations, romantic escapes, or
            relaxing coastal getaways.
          </p>

          {/* <div
            className="text-gray-600 leading-relaxed mb-3"
          
            // dangerouslySetInnerHTML={{
            //   __html: listing?.description || "No description available",
            // }}
           
          /> */}
          <div className="p-3 flex mx-[-12px]">
            <span className="font-bold  uppercase">owner&nbsp; - &nbsp;</span>
            <p className="text-[#2f9bad] ">Julie Shurden</p>
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
            src={image1}
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

      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center text-white">
        {/* FIXED BACKGROUND */}
        <div
          className="absolute inset-0 bg-fixed bg-cover bg-center"
          style={{
            backgroundImage: `url(${image3})`,
          }}
        />

        {/* <div className="absolute inset-0 bg-black/60" /> */}

        <div className="relative text-center px-4 sm:px-6"></div>
      </section>
      {/* 🔥 WHY CHOOSE US */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          {/* CONTENT */}
          <div>
            <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-black leading-tight">
              Why Choose Us
            </h3>

            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Choosing the right vacation rental can make all the difference,
              and our property is designed to give you the perfect blend of
              comfort, convenience, and luxury. Located in the heart of Panama
              City Beach, the condo offers breathtaking ocean views, direct
              beach access, and resort-style amenities that create an
              unforgettable experience. From spacious bedrooms and a fully
              equipped modern kitchen to relaxing fire pits, a tiki bar, and
              live entertainment, every detail is thoughtfully designed for your
              comfort. Guests also enjoy complimentary beach chairs and
              umbrellas, making beach days effortless and relaxing. Whether
              you’re planning a family vacation, couples retreat, or weekend
              getaway, our property provides the ideal setting for a memorable
              coastal escape.
            </p>
          </div>

          {/* IMAGE */}
          <div className="overflow-hidden rounded-2xl group">
            <img
              src={image2}
              className="w-full h-[250px] sm:h-[350px] md:h-[450px] object-cover transition duration-700 group-hover:scale-110"
              alt="Why Choose Us"
            />
          </div>
        </div>
      </section>
    </>
  );
}
