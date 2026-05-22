import { useEffect, useState } from "react";

import api from "../api/axios.js";

import { useModal } from "../context/ModalContext";

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

function SortablePhoto({
  photo,
  imageUrl,
  deletePhoto,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: photo.url,
  });

  const style = {
    transform: CSS.Transform.toString(
      transform
    ),
    transition,
  };

  return (
   <div
  ref={setNodeRef}
  style={style}
  {...attributes}
  className="relative border rounded overflow-hidden"
>
     <div
  {...listeners}
  className="cursor-grab active:cursor-grabbing"
>
  <img
    src={
      imageUrl ||
      "/placeholder.png"
    }
    alt="listing"
    className="w-full h-40 object-cover select-none"
    draggable={false}
  />
</div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          deletePhoto(photo);
        }}
        className="absolute top-2 right-2 z-50 bg-red-600 text-white text-xs px-2 py-1 rounded"
      >
        ✕
      </button>
    </div>
  );
}

export default function PhotosTab({
  listingId,
  goNextTab,
}) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] =
    useState(false);

  const { showModal } = useModal();

  const getImageUrl = (photo) => {
    const base =
      import.meta.env.VITE_API_URL || "";

    if (photo?.url) {
      return `${base}/${photo.url.replace(
        /^\//,
        ""
      )}`;
    }

    return "/placeholder.png";
  };

  useEffect(() => {
    if (!listingId) return;

    fetchPhotos();
  }, [listingId]);

  const fetchPhotos = async () => {
    try {
      const res = await api.get(
        `/listings/${listingId}`
      );

      setPhotos(res.data.photos || []);
    } catch (err) {
      console.log(err);
    }
  };

  const uploadPhotos = async (files) => {
    if (!listingId) {
      return showModal(
        "Create listing first"
      );
    }

    setUploading(true);

    const formData = new FormData();

    for (let file of files) {
      formData.append("photos", file);
    }

    try {
      const res = await api.put(
        `/listings/${listingId}/photos`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setPhotos(res.data.photos || []);
    } catch (err) {
      console.log(err);

      showModal("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photo) => {
  try {
    console.log("DELETE PHOTO:", photo);

    const filename =
      photo.url.split("/").pop();

    console.log("FILENAME:", filename);

    const res = await api.delete(
      `/listings/${listingId}/photos/${filename}`
    );

    console.log("DELETE RES:", res.data);

    setPhotos(res.data.photos || []);
  } catch (err) {
    console.log(
      "DELETE ERROR:",
      err.response?.data || err
    );

    showModal("Delete failed");
  }
};

  const handleDragEnd = async (
    event
  ) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = photos.findIndex(
        (p) => p.url === active.id
      );

      const newIndex = photos.findIndex(
        (p) => p.url === over.id
      );

      const updatedPhotos = arrayMove(
        photos,
        oldIndex,
        newIndex
      );

      const reordered =
        updatedPhotos.map(
          (photo, index) => ({
            ...photo,
            order: index,
          })
        );

      setPhotos(reordered);

      try {
        await api.put(
          `/listings/${listingId}/photos/reorder`,
          {
            photos: reordered,
          }
        );
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) =>
          uploadPhotos(e.target.files)
        }
        className="border p-2 w-full"
      />

      {uploading && (
        <p className="text-blue-600 font-semibold">
          Uploading...
        </p>
      )}

      <DndContext
        collisionDetection={
          closestCenter
        }
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={photos.map(
            (p) => p.url
          )}
          strategy={
            rectSortingStrategy
          }
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map(
              (photo, index) => (
                <SortablePhoto
                  key={
                    photo.url || index
                  }
                  photo={photo}
                  imageUrl={getImageUrl(
                    photo
                  )}
                  deletePhoto={
                    deletePhoto
                  }
                />
              )
            )}
          </div>
        </SortableContext>
      </DndContext>

      <div className="pt-6">
        <button
          onClick={goNextTab}
          className="bg-blue-600 text-white px-6 py-2 rounded cursor-pointer"
        >
          Next →
        </button>
      </div>
    </div>
  );
}