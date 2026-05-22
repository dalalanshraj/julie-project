import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [active, setActive] = useState(null);

  const getImageUrl = (path) => {
    if (!path || typeof path !== "string") return "";

    const base = import.meta.env.VITE_API_URL || "";

    // agar full URL already hai
    if (path.startsWith("http")) return path;

    // clean join
    return base.replace(/\/$/, "") + "/" + path.replace(/^\//, "");
  };

  useEffect(() => {
    api
      .get("/gallery/published")
      .then((res) => setImages(res.data))
      
      .catch(console.log);
  }, []);

  return (
    <>
      {/* 🔥 HERO SECTION */}
      <section className="relative h-[60vh] flex items-center justify-center text-white">
        {/* BG IMAGE */}
        <div
          className="absolute inset-0 bg-fixed bg-center bg-cover"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1505691938895-1758d7feb511')",
          }}
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/50" />

        {/* CONTENT */}
        <div className="relative text-center px-6">
          <h1 className="text-4xl md:text-6xl font-semibold mb-4">
            Our Gallery
          </h1>
          <p className="text-gray-200">
            Explore beautiful moments & property visuals
          </p>
        </div>
      </section>

      {/* 🔥 GALLERY GRID */}
      <section className="bg-white px-6 md:px-16 py-16">
        <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
          {images.map((img) => (
            <div
              key={img._id}
              className="relative overflow-hidden rounded-2xl group cursor-pointer"
              onClick={() => setActive(img)}
            >
              <img
                src={getImageUrl(img.image)}
                className="w-full rounded-2xl transition duration-700 group-hover:scale-110"
                onError={(e) => {
                  console.log("Gallery IMG ERROR:", e.currentTarget.src);
                  e.target.src = "/placeholder.png"; // optional fallback
                }}
              />

              {/* overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition" />
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 LIGHTBOX (ZOOM VIEW) */}
      {active && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          {/* CLOSE */}
          <button
            onClick={() => setActive(null)}
            className="absolute top-6 right-6 text-white text-3xl"
          >
            ✕
          </button>

          {/* IMAGE */}
          <img
            src={getImageUrl(active.image)}
            className="max-h-[90vh] max-w-[90vw] rounded-xl"
          />
        </div>
      )}
    </>
  );
}
