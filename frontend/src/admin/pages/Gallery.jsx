import { useEffect, useState } from "react";

import api from "../../api/axios";

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

function SortableImage({
  img,
  imageUrl,
  toggle,
  remove,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: img._id,
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
      className="bg-white rounded-xl shadow overflow-hidden"
    >
      <div
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <img
          src={imageUrl}
          className="w-full h-40 object-cover"
        />
      </div>

      <div className="p-3 flex items-center justify-between">
        <div
          onClick={() =>
            toggle(img._id)
          }
          className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
            img.status === "published"
              ? "bg-green-500"
              : "bg-gray-400"
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
              img.status === "published"
                ? "translate-x-6"
                : ""
            }`}
          />
        </div>

        <button
          onClick={() =>
            remove(img._id)
          }
          className="text-red-500 text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function GalleryAdmin() {
  const [images, setImages] = useState(
    []
  );

  const [uploading, setUploading] =
    useState(false);

  const getImageUrl = (path) => {
    const base =
      import.meta.env.VITE_API_URL || "";

    return (
      base.replace(/\/$/, "") +
      "/" +
      path.replace(/^\//, "")
    );
  };

  const fetchData = async () => {
    const res = await api.get("/gallery");

    setImages(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const upload = async (files) => {
    setUploading(true);

    const formData = new FormData();

    for (let file of files) {
      formData.append("images", file);
    }

    try {
      await api.post(
        "/gallery",
        formData
      );

      fetchData();
    } catch (err) {
      console.log(err);
    } finally {
      setUploading(false);
    }
  };

  const toggle = async (id) => {
    await api.put(
      `/gallery/${id}/toggle`
    );

    fetchData();
  };

  const remove = async (id) => {
    if (
      !window.confirm(
        "Delete this image?"
      )
    )
      return;

    await api.delete(`/gallery/${id}`);

    fetchData();
  };

  const handleDragEnd = async (
    event
  ) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = images.findIndex(
        (i) => i._id === active.id
      );

      const newIndex = images.findIndex(
        (i) => i._id === over.id
      );

      const updated = arrayMove(
        images,
        oldIndex,
        newIndex
      );

      const reordered = updated.map(
        (img, index) => ({
          ...img,
          order: index,
        })
      );

      setImages(reordered);

      await api.put(
        "/gallery/reorder",
        {
          images: reordered,
        }
      );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Gallery Manager
        </h1>

        <label className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer">
          Upload Images

          <input
            type="file"
            hidden
            multiple
            accept="image/*"
            onChange={(e) =>
              upload(e.target.files)
            }
          />
        </label>
      </div>

      {uploading && (
        <p className="mb-4 text-blue-600 font-semibold">
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
          items={images.map(
            (i) => i._id
          )}
          strategy={
            rectSortingStrategy
          }
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {images.map((img) => (
              <SortableImage
                key={img._id}
                img={img}
                imageUrl={getImageUrl(
                  img.image
                )}
                toggle={toggle}
                remove={remove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}