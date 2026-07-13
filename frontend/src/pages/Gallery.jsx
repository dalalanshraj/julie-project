import { useEffect, useState } from "react";
import api from "../api/axios";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mobile swipe
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const getImageUrl = (photo) => {
    const base = import.meta.env.VITE_API_URL || "";

    // Object format
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

    // String format
    if (typeof photo === "string" && photo.trim()) {
      if (photo.startsWith("http")) {
        return photo;
      }

      return (
        base.replace(/\/$/, "") +
        "/" +
        photo.replace(/^\//, "")
      );
    }

    return "/placeholder.png";
  };

  // =========================
  // FETCH GALLERY
  // =========================

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);

        const res = await api.get("/gallery/published");

        console.log("GALLERY API RESPONSE:", res.data);

        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.gallery || [];

        setImages(data);
      } catch (error) {
        console.error(
          "GALLERY FETCH ERROR:",
          error.response?.data || error.message
        );

        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  // =========================
  // HERO IMAGE
  // =========================

  const heroImage =
    images.length > 0
      ? getImageUrl(images[2]?.image || images[0]?.image)
      : "/placeholder.png";

  // =========================
  // SLIDER FUNCTIONS
  // =========================

  const closeLightbox = () => {
    setActiveIndex(null);
  };

  const showNextImage = () => {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null || images.length === 0) {
        return null;
      }

      return (currentIndex + 1) % images.length;
    });
  };

  const showPreviousImage = () => {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null || images.length === 0) {
        return null;
      }

      return (currentIndex - 1 + images.length) % images.length;
    });
  };

  // =========================
  // KEYBOARD NAVIGATION
  // =========================

  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyboard = (event) => {
      if (event.key === "ArrowRight") {
        showNextImage();
      }

      if (event.key === "ArrowLeft") {
        showPreviousImage();
      }

      if (event.key === "Escape") {
        closeLightbox();
      }
    };

    window.addEventListener("keydown", handleKeyboard);

    // Prevent background scroll
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyboard);

      document.body.style.overflow = "";
    };
  }, [activeIndex, images.length]);

  // =========================
  // MOBILE SWIPE
  // =========================

  const handleTouchStart = (event) => {
    setTouchEnd(null);

    setTouchStart(event.targetTouches[0].clientX);
  };

  const handleTouchMove = (event) => {
    setTouchEnd(event.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;

    const distance = touchStart - touchEnd;

    const swipedLeft = distance > minSwipeDistance;
    const swipedRight = distance < -minSwipeDistance;

    if (swipedLeft) {
      showNextImage();
    }

    if (swipedRight) {
      showPreviousImage();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <>
      {/* ================= HERO ================= */}

      <section className="relative h-[30vh] flex items-center justify-center text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{
            backgroundImage: `url("${heroImage}")`,
          }}
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl md:text-6xl font-semibold mb-4">
            Our Gallery
          </h1>

          <p className="text-gray-200">
            Explore beautiful moments & property visuals
          </p>
        </div>
      </section>

      {/* ================= GALLERY ================= */}

      <section className="bg-white px-4 sm:px-6 md:px-16 py-16">
        {loading ? (
          <div className="text-center py-20">
            Loading gallery...
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No gallery images available.
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {images.map((item, index) => {
              const imageUrl = getImageUrl(item.image);

              return (
                <div
                  key={item._id || index}
                  className="relative break-inside-avoid overflow-hidden rounded-2xl group cursor-pointer"
                  onClick={() => setActiveIndex(index)}
                >
                  <img
                    src={imageUrl}
                    alt={item.title || `Gallery image ${index + 1}`}
                    loading="lazy"
                    className="block w-full h-auto rounded-2xl transition-transform duration-700 group-hover:scale-110"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = "/placeholder.png";
                    }}
                  />

                  <div className="absolute   group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= LIGHTBOX SLIDER ================= */}

      {activeIndex !== null && images[activeIndex] && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center overflow-hidden"
          onClick={closeLightbox}
        >
          {/* CLOSE BUTTON */}

          <button
            type="button"
            aria-label="Close gallery"
            onClick={(event) => {
              event.stopPropagation();
              closeLightbox();
            }}
            className="
              absolute
              top-4
              right-4
              md:top-6
              md:right-8
              z-30

              w-11
              h-11

              flex
              items-center
              justify-center

              rounded-full
              bg-black/50
              text-white

              hover:bg-white
              hover:text-black

              transition
            "
          >
            <X size={26} />
          </button>

          {/* IMAGE COUNTER */}

          <div
            className="
              absolute
              top-5
              left-1/2
              -translate-x-1/2

              z-30

              px-4
              py-2

              rounded-full
              bg-black/50

              text-white
              text-sm
            "
          >
            {activeIndex + 1} / {images.length}
          </div>

          {/* PREVIOUS BUTTON */}

          {images.length > 1 && (
            <button
              type="button"
              aria-label="Previous image"
              onClick={(event) => {
                event.stopPropagation();
                showPreviousImage();
              }}
              className="
                absolute
                left-2
                md:left-8

                z-30

                w-11
                h-11
                md:w-14
                md:h-14

                flex
                items-center
                justify-center

                rounded-full

                bg-black/50
                text-white

                hover:bg-white
                hover:text-black

                transition
              "
            >
              <ChevronLeft className="w-7 h-7 md:w-9 md:h-9" />
            </button>
          )}

          {/* ACTIVE IMAGE */}

          <div
            className="
              w-full
              h-full

              px-14
              py-20

              md:px-28
              md:py-16

              flex
              items-center
              justify-center
            "
            onClick={(event) => event.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              key={images[activeIndex]._id || activeIndex}
              src={getImageUrl(images[activeIndex].image)}
              alt={
                images[activeIndex].title ||
                `Gallery image ${activeIndex + 1}`
              }
              draggable="false"
              className="
                max-w-full
                max-h-full

                w-auto
                h-auto

                object-contain

                rounded-xl

                select-none

                animate-[fadeGallery_.3s_ease-in-out]
              "
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/placeholder.png";
              }}
            />
          </div>

          {/* NEXT BUTTON */}

          {images.length > 1 && (
            <button
              type="button"
              aria-label="Next image"
              onClick={(event) => {
                event.stopPropagation();
                showNextImage();
              }}
              className="
                absolute
                right-2
                md:right-8

                z-30

                w-11
                h-11
                md:w-14
                md:h-14

                flex
                items-center
                justify-center

                rounded-full

                bg-black/50
                text-white

                hover:bg-white
                hover:text-black

                transition
              "
            >
              <ChevronRight className="w-7 h-7 md:w-9 md:h-9" />
            </button>
          )}
        </div>
      )}
    </>
  );
}