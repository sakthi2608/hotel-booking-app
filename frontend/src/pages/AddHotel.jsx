import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { useLocation, useNavigate } from "react-router-dom";
import "./AddHotel.css";
import Navbar from "../components/Navbar";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15);
    }
  }, [position, map]);

  return null;
}

function AddHotel() {
  const navigate = useNavigate();
  const locationState = useLocation();
  const editHotel = locationState.state?.hotel;

  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [gallery, setGallery] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [highlights, setHighlights] = useState("");
  const [facilities, setFacilities] = useState("");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [price, setPrice] = useState("");
  const [roomTypes, setRoomTypes] = useState([]);

  const [breakfastIncluded, setBreakfastIncluded] = useState(false);
  const [freeCancellation, setFreeCancellation] = useState(false);
  const [payAtHotel, setPayAtHotel] = useState(false);
  const [roomView, setRoomView] = useState("");
  const [houseRules, setHouseRules] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [mapPosition, setMapPosition] = useState([
    10.9601,
    78.0766,
  ]);

  const [suggestions, setSuggestions] = useState([]);
  const locationTimer = useRef(null);
  const [receptionNumber, setReceptionNumber] = useState("");

  useEffect(() => {
    if (!editHotel) {
      return;
    }

    setExistingImage(editHotel.image || "");
    setTitle(editHotel.title || "");
    setDescription(editHotel.description || "");
    setLocation(editHotel.location || "");
    setLatitude(editHotel.latitude || "");
    setLongitude(editHotel.longitude || "");
    setPrice(editHotel.price || "");

    setReceptionNumber(
      editHotel.reception_number
        ? editHotel.reception_number.replace(/^\+91/, "")
        : ""
    );

    const existingRoomTypes = Array.isArray(editHotel.room_types)
      ? editHotel.room_types.map((room) => ({
          ...room,
          price:
            room.price !== undefined && room.price !== null
              ? Number(room.price)
              : Number(editHotel.price || 0),
        }))
      : [];

    setRoomTypes(existingRoomTypes);

    const existingHighlights = Array.isArray(editHotel.highlights)
      ? editHotel.highlights
      : [];

    const existingFacilities = Array.isArray(editHotel.facilities)
      ? editHotel.facilities
      : [];

    setHighlights(existingHighlights.join(", "));
    setFacilities(existingFacilities.join(", "));

    setBreakfastIncluded(
      editHotel.breakfast_included === true ||
        editHotel.breakfast_included === "true" ||
        editHotel.breakfast_included === "yes" ||
        editHotel.breakfast_included === "Yes" ||
        editHotel.breakfast_included === 1
    );

    setFreeCancellation(
      editHotel.free_cancellation === true ||
        editHotel.free_cancellation === "true" ||
        editHotel.free_cancellation === "yes" ||
        editHotel.free_cancellation === "Yes" ||
        editHotel.free_cancellation === 1
    );

    setPayAtHotel(
      editHotel.pay_at_hotel === true ||
        editHotel.pay_at_hotel === "true" ||
        editHotel.pay_at_hotel === "yes" ||
        editHotel.pay_at_hotel === "Yes" ||
        editHotel.pay_at_hotel === 1
    );

    setRoomView(
      editHotel.room_view ||
      editHotel.roomView ||
      ""
    );

    let existingHouseRules = [];

    if (Array.isArray(editHotel.house_rules)) {
      existingHouseRules = editHotel.house_rules;
    } else if (Array.isArray(editHotel.houseRules)) {
      existingHouseRules = editHotel.houseRules;
    } else if (typeof editHotel.house_rules === "string") {
      existingHouseRules = editHotel.house_rules
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    } else if (typeof editHotel.houseRules === "string") {
      existingHouseRules = editHotel.houseRules
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    setHouseRules(existingHouseRules);

    if (editHotel.latitude && editHotel.longitude) {
      setMapPosition([
        Number(editHotel.latitude),
        Number(editHotel.longitude),
      ]);
    }
  }, [editHotel]);

  function handleMainImage(file) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed");
      return;
    }

    setImage(file);
  }

  const handleRoomTypeChange = (type) => {
    setRoomTypes((prev) => {
      const exists = prev.find((room) => room.type === type);

      if (exists) {
        return prev.filter((room) => room.type !== type);
      }

      return [
        ...prev,
        {
          type: type,
          rooms: 1,
          guestsPerRoom: 2,
          price: Number(price) || 0,
        },
      ];
    });
  };

  const handleGuestCapacityChange = (type, value) => {
    setRoomTypes((prev) =>
      prev.map((room) =>
        room.type === type
          ? {
              ...room,
              guestsPerRoom: Number(value),
            }
          : room
      )
    );
  };

  const handleRoomPriceChange = (type, value) => {
    setRoomTypes((prev) =>
      prev.map((room) =>
        room.type === type
          ? {
              ...room,
              price: Number(value),
            }
          : room
      )
    );
  };

  function handleGalleryImages(files) {
    const selectedFiles = Array.from(files);

    const validFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length !== selectedFiles.length) {
      alert("Only image files are allowed");
    }

    const newGalleryImages = validFiles.map((file) => ({
      file: file,
      type: "Room",
    }));

    setGallery((currentGallery) => [
      ...currentGallery,
      ...newGalleryImages,
    ]);
  }

  function removeGalleryImage(index) {
    setGallery((currentGallery) =>
      currentGallery.filter((_, fileIndex) => fileIndex !== index)
    );
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();

    const file = event.dataTransfer.files[0];

    handleMainImage(file);
  }

  function getLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lon);
        setMapPosition([lat, lon]);
        setSuggestions([]);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );

          if (!response.ok) {
            return;
          }

          const data = await response.json();

          if (data.display_name) {
            setLocation(data.display_name);
          }
        } catch (error) {
          console.log("Reverse geocoding error:", error);
        }
      },
      (error) => {
        console.log("Location error:", error);
        alert("Unable to get your location. Please allow location access.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  function findLocationSuggestions(value) {
    setLocation(value);
    setLatitude("");
    setLongitude("");
    setSuggestions([]);

    if (locationTimer.current) {
      clearTimeout(locationTimer.current);
    }

    if (value.trim().length < 3) {
      return;
    }

    locationTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(
          "https://hotel-booking-app-wswq.onrender.com/api/location-suggestions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              address: value.trim(),
            }),
          }
        );

        if (!response.ok) {
          setSuggestions([]);
          return;
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setSuggestions(data);
        }
      } catch (error) {
        console.log("Location search error:", error);
        setSuggestions([]);
      }
    }, 1200);
  }

  function selectLocation(place) {
    const lat = Number(place.lat);
    const lon = Number(place.lon);

    setLocation(place.display_name);
    setLatitude(lat);
    setLongitude(lon);
    setMapPosition([lat, lon]);
    setSuggestions([]);
  }

  async function updateLocationFromCoordinates(lat, lon) {
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return;
    }

    setMapPosition([lat, lon]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (data.address) {
        const address = data.address;

        const place =
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          address.district ||
          "";

        const state = address.state || "";
        const country = address.country || "";

        const locationText = [place, state, country]
          .filter(Boolean)
          .join(", ");

        if (locationText) {
          setLocation(locationText);
        }
      }
    } catch (error) {
      console.log("Reverse geocoding error:", error);
    }
  }

  function handleHouseRuleChange(rule) {
    setHouseRules((currentRules) => {
      if (currentRules.includes(rule)) {
        return currentRules.filter((item) => item !== rule);
      }

      return [...currentRules, rule];
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (
      (!image && !editHotel) ||
      !title.trim() ||
      !description.trim() ||
      !location.trim() ||
      !latitude ||
      !longitude ||
      !price ||
      roomTypes.length === 0
    ) {
      alert("Please fill all fields");
      return;
    }

    if (Number(price) <= 0) {
      alert("Price must be greater than 0");
      return;
    }

    const invalidRoomPrice = roomTypes.some(
      (room) => !room.price || Number(room.price) <= 0
    );

    if (invalidRoomPrice) {
      alert("Enter a valid price for all selected room types");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(receptionNumber)) {
      alert("Enter a valid 10-digit Indian mobile number");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      if (image) {
        formData.append("image", image);
      }

      gallery.forEach((item) => {
        formData.append("gallery", item.file);
      });

      gallery.forEach((item) => {
        formData.append("galleryType", item.type);
      });

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("location", location.trim());
      formData.append("highlights", highlights.trim());
      formData.append("facilities", facilities.trim());
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      formData.append("price", price);

      formData.append(
        "reception_number",
        `+91${receptionNumber}`
      );

      formData.append(
        "room_types",
        JSON.stringify(roomTypes)
      );

      formData.append(
        "breakfast_included",
        breakfastIncluded
      );

      formData.append(
        "free_cancellation",
        freeCancellation
      );

      formData.append(
        "pay_at_hotel",
        payAtHotel
      );

      formData.append(
        "room_view",
        roomView
      );

      formData.append(
        "house_rules",
        JSON.stringify(houseRules)
      );

      const url = editHotel
  ? `https://hotel-booking-app-wswq.onrender.com/api/hotels/${editHotel.id}`
  : "https://hotel-booking-app-wswq.onrender.com/api/hotels";
      const method = editHotel ? "PUT" : "POST";

      console.log("URL:", url);
      console.log("METHOD:", method);

      console.log(
        "SENDING HOTEL:",
        Object.fromEntries(formData)
      );

      for (const [key, value] of formData.entries()) {
        console.log("FORM DATA:", key, value);
      }

      const response = await fetch(url, {
        method,
        body: formData,
      });

      const data = await response.json();

      console.log("SERVER RESPONSE:", data);
      console.log("SERVER MESSAGE:", data.message);

      if (!response.ok) {
        alert(data.message || "Failed to save hotel");
        return;
      }

      setSuccessMessage(
        editHotel
          ? "Hotel updated successfully!"
          : "Hotel added successfully!"
      );
    } catch (error) {
      console.log("SAVE HOTEL ERROR:", error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="add-hotel">
      <Navbar />

      {successMessage && (
        <div className="popup-overlay">
          <div className="success-popup-box">
            <div className="success-icon">✓</div>
            <h3>Success!</h3>
            <p>{successMessage}</p>

            <button
              type="button"
              onClick={() => {
                setSuccessMessage("");
                navigate("/");
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="atelier-header">
        <h1>{editHotel ? "Edit Hotel" : "Hotel Atelier"}</h1>
        <p>
          {editHotel
            ? "Refine your hotel details"
            : "Create a stay worth remembering"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="hotel-form">
        <div className="hotel-form-left">
          <div className="form-section">
            <label>Hotel Image</label>

            <div
              className="drop-zone"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <p>Drag & drop your hotel image here</p>
              <span>or</span>

              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  handleMainImage(event.target.files[0])
                }
              />
            </div>
          </div>

          {editHotel && existingImage && !image && (
            <div className="main-image-preview">
              <img
                src={existingImage}
                alt="Existing hotel"
              />
            </div>
          )}

          {image && (
            <div className="main-image-preview">
              <img
                src={URL.createObjectURL(image)}
                alt="New hotel preview"
              />
            </div>
          )}

          <div className="form-section">
            <label>Gallery Images</label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) =>
                handleGalleryImages(event.target.files)
              }
            />

            {gallery.length > 0 && (
              <div className="gallery-preview">
                {gallery.map((item, index) => (
                  <div className="gallery-item" key={index}>
                    <img
                      src={URL.createObjectURL(item.file)}
                      alt={`Gallery ${index + 1}`}
                    />

                    <select
                      value={item.type}
                      onChange={(event) => {
                        const newType = event.target.value;

                        setGallery((currentGallery) =>
                          currentGallery.map(
                            (galleryItem, galleryIndex) =>
                              galleryIndex === index
                                ? {
                                    ...galleryItem,
                                    type: newType,
                                  }
                                : galleryItem
                          )
                        );
                      }}
                    >
                      <option value="Room">Room</option>
                      <option value="Amenities">Amenities</option>
                      <option value="Reception">Reception</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Swimming Pool">
                        Swimming Pool
                      </option>
                      <option value="Exterior">Exterior</option>
                      <option value="Other">Other</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-section location-section">
            <label>Location</label>

            <input
              type="text"
              value={location}
              onChange={(event) =>
                findLocationSuggestions(event.target.value)
              }
              placeholder="Enter hotel address"
            />

            {suggestions.length > 0 && (
              <div className="location-suggestions">
                {suggestions.map((place) => (
                  <div
                    key={place.place_id}
                    className="location-suggestion"
                    onClick={() => selectLocation(place)}
                  >
                    <span className="location-icon">📍</span>

                    <div>
                      <strong>
                        {place.address?.suburb ||
                          place.address?.village ||
                          place.address?.town ||
                          place.name}
                      </strong>

                      <p>
                        {place.address?.city ||
                          place.address?.district ||
                          ""}

                        {place.address?.state
                          ? `, ${place.address.state}`
                          : ""}

                        {place.address?.postcode
                          ? ` - ${place.address.postcode}`
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="location-map-section">
            <span
              className="current-location-link"
              onClick={getLocation}
            >
              📍 Use my current location
            </span>

            <div className="map-container">
              <MapContainer
                center={mapPosition}
                zoom={15}
                style={{
                  height: "350px",
                  width: "100%",
                }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapUpdater position={mapPosition} />

                <Marker position={mapPosition}>
                  <Popup>
                    {location || "Selected location"}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>

        <div className="hotel-form-right">
          <div className="form-section">
            <label>Hotel Name</label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Enter hotel name"
            />
          </div>

          <div className="form-section">
            <label>Description</label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Enter hotel description"
            />
          </div>

          <div className="form-section">
            <label>Highlights</label>

            <input
              type="text"
              value={highlights}
              onChange={(event) =>
                setHighlights(event.target.value)
              }
              placeholder="Luxury rooms, City view, Free Wi-Fi"
            />
          </div>

          <div className="form-section">
            <label>Facilities</label>

            <input
              type="text"
              value={facilities}
              onChange={(event) =>
                setFacilities(event.target.value)
              }
              placeholder="Free Wi-Fi, Parking, Restaurant"
            />
          </div>

          <div className="form-group">
            <label>Room Types Available</label>

            <div className="room-types-list">
              {[
                "Standard Room",
                "Deluxe Room",
                "Suite",
                "Family Room",
              ].map((type) => {
                const selectedRoom = roomTypes.find(
                  (room) => room.type === type
                );

                return (
                  <div
                    key={type}
                    className={`room-type-row ${
                      selectedRoom ? "selected" : ""
                    }`}
                  >
                    <label className="room-type-check">
                      <input
                        type="checkbox"
                        checked={!!selectedRoom}
                        onChange={() =>
                          handleRoomTypeChange(type)
                        }
                      />
                      <span>{type}</span>
                    </label>

                    {selectedRoom && (
                      <div className="room-type-inputs">
                        <input
                          type="number"
                          min="1"
                          value={selectedRoom.rooms}
                          onChange={(e) =>
                            setRoomTypes((prev) =>
                              prev.map((room) =>
                                room.type === type
                                  ? {
                                      ...room,
                                      rooms: Number(
                                        e.target.value
                                      ),
                                    }
                                  : room
                              )
                            )
                          }
                          placeholder="Rooms"
                        />

                        <input
                          type="number"
                          min="1"
                          value={selectedRoom.guestsPerRoom}
                          onChange={(e) =>
                            handleGuestCapacityChange(
                              type,
                              e.target.value
                            )
                          }
                          placeholder="Guests / room"
                        />

                        <input
                          type="number"
                          min="1"
                          value={selectedRoom.price}
                          onChange={(e) =>
                            handleRoomPriceChange(
                              type,
                              e.target.value
                            )
                          }
                          placeholder="Price / night"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label>Hotel Options</label>

            <div className="hotel-options-list">
              <label>
                <input
                  type="checkbox"
                  checked={breakfastIncluded}
                  onChange={(e) =>
                    setBreakfastIncluded(e.target.checked)
                  }
                />
                <span>Breakfast included</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={freeCancellation}
                  onChange={(e) =>
                    setFreeCancellation(e.target.checked)
                  }
                />
                <span>Free cancellation</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={payAtHotel}
                  onChange={(e) =>
                    setPayAtHotel(e.target.checked)
                  }
                />
                <span>Pay at hotel</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Room View</label>

            <select
              value={roomView}
              onChange={(e) => setRoomView(e.target.value)}
            >
              <option value="">Select room view</option>
              <option value="City View">City View</option>
              <option value="Garden View">Garden View</option>
              <option value="Pool View">Pool View</option>
            </select>
          </div>

          <div className="form-group">
            <label>House Rules</label>

            <div className="hotel-options-list">
              <label>
                <input
                  type="checkbox"
                  checked={houseRules.includes("Couple Friendly")}
                  onChange={() =>
                    handleHouseRuleChange("Couple Friendly")
                  }
                />
                <span>Couple Friendly</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={houseRules.includes("Pet Friendly")}
                  onChange={() =>
                    handleHouseRuleChange("Pet Friendly")
                  }
                />
                <span>Pet Friendly</span>
              </label>
            </div>
          </div>

          <div className="coordinates-row">
            <div className="form-section">
              <label>Latitude</label>

              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(event) => {
                  const value = event.target.value;
                  setLatitude(value);

                  const lat = Number(value);
                  const lon = Number(longitude);

                  if (
                    value !== "" &&
                    longitude !== "" &&
                    lat >= -90 &&
                    lat <= 90 &&
                    lon >= -180 &&
                    lon <= 180
                  ) {
                    updateLocationFromCoordinates(
                      lat,
                      lon
                    );
                  }
                }}
                placeholder="10.9601"
              />
            </div>

            <div className="form-section">
              <label>Longitude</label>

              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(event) => {
                  const value = event.target.value;
                  setLongitude(value);

                  const lat = Number(latitude);
                  const lon = Number(value);

                  if (
                    latitude !== "" &&
                    value !== "" &&
                    lat >= -90 &&
                    lat <= 90 &&
                    lon >= -180 &&
                    lon <= 180
                  ) {
                    updateLocationFromCoordinates(
                      lat,
                      lon
                    );
                  }
                }}
                placeholder="78.0766"
              />
            </div>
          </div>

          <div className="form-section">
            <label>Price per Night</label>

            <input
              type="number"
              value={price}
              onChange={(event) =>
                setPrice(event.target.value)
              }
              placeholder="Enter price"
            />
          </div>

          <div className="form-group">
            <label>Hotel Reception Number</label>

            <div className="phone-input">
              <span className="country-code">+91</span>

              <input
                type="tel"
                value={receptionNumber}
                maxLength={10}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setReceptionNumber(value);
                }}
                placeholder="9876543210"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="add-hotel-button"
          >
            {isSubmitting
              ? editHotel
                ? "Updating Hotel..."
                : "Adding Hotel..."
              : editHotel
              ? "Update Hotel"
              : "Add Hotel"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddHotel;

