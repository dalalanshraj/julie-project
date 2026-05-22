import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import { useEffect, useState } from "react";


import api from "../api/axios.js";

import { useModal } from "../context/ModalContext";

import "leaflet/dist/leaflet.css";

// ==========================================
// FIX LEAFLET ICONS
// ==========================================
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ==========================================
// RED ICON
// ==========================================
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],

  iconAnchor: [12, 41],
});

// ==========================================
// MAP CENTER UPDATE
// ==========================================
function ChangeMapView({ position }) {

  const map = useMap();

  useEffect(() => {

    const lat =
      Number(position.lat);

    const lng =
      Number(position.lng);

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng)
    ) {

      map.setView(
        [lat, lng],
        15
      );
    }

  }, [position, map]);

  return null;
}

// ==========================================
// MARKER
// ==========================================
function LocationMarker({
  position,
  setPosition,
}) {

  useMapEvents({

    click(e) {

      setPosition({
        lat: String(e.latlng.lat),
        lng: String(e.latlng.lng),
      });
    },
  });

  const lat = Number(position.lat);
  const lng = Number(position.lng);

  // INVALID VALUE
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return null;
  }

  return (
    <Marker
      key={`${lat}-${lng}`}

      position={[lat, lng]}

      icon={redIcon}

      draggable={true}

      opacity={1}

      zIndexOffset={1000}

      eventHandlers={{
        dragend: (e) => {

          const marker =
            e.target.getLatLng();

          setPosition({
            lat: String(marker.lat),
            lng: String(marker.lng),
          });
        },
      }}
    />
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function LocationTab({
  listingId,
  goNextTab,
}) {

  const { showModal } =
    useModal();

  const [position, setPosition] =
    useState({
      lat: "30.2447",
      lng: "-87.7056",
    });

  const [address, setAddress] =
    useState("");

  // ==========================================
  // LOAD LOCATION
  // ==========================================
  useEffect(() => {

    if (!listingId) return;

    api
      .get(`/listings/${listingId}`)

      .then((res) => {

        const savedLat =
          Number(
            res.data?.location?.lat
          );

        const savedLng =
          Number(
            res.data?.location?.lng
          );

        if (
          Number.isFinite(savedLat) &&
          Number.isFinite(savedLng)
        ) {

          setPosition({
            lat: String(savedLat),

            lng: String(savedLng),
          });
        }

        setAddress(
          res.data?.location
            ?.address || ""
        );
      })

      .catch((err) => {
        console.log(err);
      });

  }, [listingId]);

  // ==========================================
  // SAVE LOCATION
  // ==========================================
  const saveLocation = async () => {

    let lat =
      Number(position.lat);

    let lng =
      Number(position.lng);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {

      showModal(
        "Invalid coordinates"
      );

      return;
    }

    // USA longitude fix
    if (
      lng > 0 &&
      lat > 20
    ) {

      lng =
        -Math.abs(lng);
    }

    try {

      await api.put(
        `/listings/${listingId}/location`,
        {
          lat,
          lng,
          address,
        }
      );

      showModal(
        "Location Saved"
      );

      goNextTab();

    } catch (err) {

      console.log(err);

      showModal(
        "Save failed"
      );
    }
  };

  // ==========================================
  // SEARCH ADDRESS
  // ==========================================
  const locateByAddress =
    async () => {

      if (!address) {

        showModal(
          "Please enter address"
        );

        return;
      }

      try {

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            address
          )}`
        );

        const data =
          await res.json();

        if (!data.length) {

          showModal(
            "Address not found"
          );

          return;
        }

        const lat =
          Number(data[0].lat);

        let lng =
          Number(data[0].lon);

        // USA longitude fix
        if (
          lng > 0 &&
          lat > 20
        ) {

          lng =
            -Math.abs(lng);
        }

        setPosition({
          lat: String(lat),

          lng: String(lng),
        });

        showModal(
          "Location Found"
        );

      } catch (err) {

        console.log(err);

        showModal(
          "Location search failed"
        );
      }
    };

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-5">

      {/* HEADER */}
      <div>

        <h2 className="text-2xl font-bold">
          Property Location
        </h2>

        <p className="text-sm text-gray-500">
          Click map or drag marker
          to set exact location
        </p>

      </div>

      {/* ADDRESS */}
      <div>

        <label className="block text-sm font-semibold mb-2">
          Property Address
        </label>

        <input
          type="text"

          value={address}

          onChange={(e) =>
            setAddress(
              e.target.value
            )
          }

          placeholder="Enter property address"

          className="border rounded-lg p-3 w-full"
        />

      </div>

      {/* ADDRESS BUTTON */}
      <button
        onClick={locateByAddress}

        className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold"
      >
        Locate Address
      </button>

      {/* MAP */}
      <div className="overflow-hidden rounded-xl border">

       <MapContainer
  key={`${position.lat}-${position.lng}`}

  center={[
    Number(position.lat) || 30.2447,
    Number(position.lng) || -87.7056,
  ]}

          zoom={13}

          style={{
            width: "100%",
            height: "500px",
          }}
        >

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"

            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ChangeMapView
            position={position}
          />

          <LocationMarker
            position={position}
            setPosition={setPosition}
          />

        </MapContainer>

      </div>

      {/* LAT LNG */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* LAT */}
        <div>

          <label className="text-sm font-semibold">
            Latitude
          </label>

          <input
            type="number"

            step="any"

            value={position.lat}

            onChange={(e) =>
              setPosition((prev) => ({
                ...prev,
                lat: e.target.value,
              }))
            }

            className="border p-3 rounded-lg w-full"
          />

        </div>

        {/* LNG */}
        <div>

          <label className="text-sm font-semibold">
            Longitude
          </label>

          <input
            type="number"

            step="any"

            value={position.lng}

            onChange={(e) =>
              setPosition((prev) => ({
                ...prev,
                lng: e.target.value,
              }))
            }

            className="border p-3 rounded-lg w-full"
          />

        </div>

      </div>

      {/* SAVE */}
      <div className="flex justify-end pt-4">

        <button
          onClick={saveLocation}

          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Save & Continue
        </button>

      </div>

    </div>
  );
}