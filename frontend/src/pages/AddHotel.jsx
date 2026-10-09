
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
import Navbar from "../components/Navbar";
import "./AddHotel.css";

const BACKEND_URL = "https://savi-hotel-backend.onrender.com";
const API_URL = `${BACKEND_URL}/api/hotels`;
const LOCATION_API = `${BACKEND_URL}/api/location-suggestions`;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position && position.every(Number.isFinite)) {
      map.flyTo(position, 14);
    }
  }, [position, map]);

  return null;
}

function AddHotel() {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const editHotel = routeLocation.state?.hotel || null;
  const locationTimer = useRef(null);

  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [gallery, setGallery] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);
  const [galleryType, setGalleryType] = useState("Room");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [highlights, setHighlights] = useState("");
  const [facilities, setFacilities] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [price, setPrice] = useState("");
  const [receptionNumber, setReceptionNumber] = useState("");
  const [roomTypes, setRoomTypes] = useState([
    { type: "Deluxe Room", rooms: "1", guestsPerRoom: "2" },
  ]);
  const [breakfastIncluded, setBreakfastIncluded] = useState(false);
  const [freeCancellation, setFreeCancellation] = useState(false);
  const [payAtHotel, setPayAtHotel] = useState(false);
  const [roomView, setRoomView] = useState("");
  const [houseRules, setHouseRules] = useState("");

  const [mapPosition, setMapPosition] = useState([10.9601, 78.0766]);
  const [suggestions, setSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function imageUrl(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return `${BACKEND_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  }

  useEffect(() => {
    if (!editHotel) return;

    setExistingImage(editHotel.image || "");
    setExistingGallery(
      Array.isArray(editHotel.gallery) ? editHotel.gallery : []
    );
    setTitle(editHotel.title || "");
    setDescription(editHotel.description || "");
    setLocation(editHotel.location || "");
    setLatitude(editHotel.latitude ?? "");
    setLongitude(editHotel.longitude ?? "");
    setPrice(editHotel.price ?? "");
    setReceptionNumber(
      String(editHotel.reception_number || "").replace(/^\+91/, "")
    );

    setHighlights(
      Array.isArray(editHotel.highlights)
        ? editHotel.highlights.join(", ")
        : typeof editHotel.highlights === "string"
        ? editHotel.highlights
        : ""
    );

    setFacilities(
      Array.isArray(editHotel.facilities)
        ? editHotel.facilities.join(", ")
        : typeof editHotel.facilities === "string"
        ? editHotel.facilities
        : ""
    );

    setRoomTypes(
      Array.isArray(editHotel.room_types) && editHotel.room_types.length
        ? editHotel.room_types.map((room) => ({
            type: room.type || "",
            rooms: String(room.rooms ?? "1"),
            guestsPerRoom: String(room.guestsPerRoom ?? "2"),
          }))
        : [{ type: "Deluxe Room", rooms: "1", guestsPerRoom: "2" }]
    );

    setBreakfastIncluded(Boolean(editHotel.breakfast_included));
    setFreeCancellation(Boolean(editHotel.free_cancellation));
    setPayAtHotel(Boolean(editHotel.pay_at_hotel));
    setRoomView(editHotel.room_view || "");

    const rules = editHotel.house_rules;
    setHouseRules(
      Array.isArray(rules)
        ? rules.join(", ")
        : typeof rules === "string"
        ? (() => {
            try {
              const parsed = JSON.parse(rules);
              return Array.isArray(parsed) ? parsed.join(", ") : rules;
            } catch {
              return rules;
            }
          })()
        : ""
    );

    if (
      editHotel.latitude != null &&
      editHotel.longitude != null &&
      Number.isFinite(Number(editHotel.latitude)) &&
      Number.isFinite(Number(editHotel.longitude))
    ) {
      setMapPosition([
        Number(editHotel.latitude),
        Number(editHotel.longitude),
      ]);
    }
  }, [editHotel]);

  useEffect(() => {
    return () => {
      if (locationTimer.current) clearTimeout(locationTimer.current);
    };
  }, []);

  function handleMainImage(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file.");
      return;
    }
    setImage(file);
    setErrorMessage("");
  }

  function handleGalleryFiles(fileList) {
    const files = Array.from(fileList || []);
    const validFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    setGallery((current) => {
      const combined = [...current, ...validFiles];
      return combined.slice(0, 4);
    });

    if (validFiles.length !== files.length) {
      setErrorMessage("Only image files can be uploaded.");
    } else {
      setErrorMessage("");
    }

    if (gallery.length + validFiles.length > 4) {
      setErrorMessage("A maximum of 4 new gallery images is allowed.");
    }
  }

  function updateRoom(index, field, value) {
    setRoomTypes((current) =>
      current.map((room, i) =>
        i === index ? { ...room, [field]: value } : room
      )
    );
  }

  function addRoom() {
    setRoomTypes((current) => [
      ...current,
      { type: "", rooms: "1", guestsPerRoom: "2" },
    ]);
  }

  function removeRoom(index) {
    setRoomTypes((current) => current.filter((_, i) => i !== index));
  }

  function findLocationSuggestions(value) {
    setLocation(value);
    setSuggestions([]);

    if (locationTimer.current) clearTimeout(locationTimer.current);
    if (value.trim().length < 3) return;

    locationTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(LOCATION_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: value.trim() }),
        });

        if (!response.ok) return;

        const data = await response.json();
        if (Array.isArray(data)) setSuggestions(data);
      } catch (error) {
        console.error("Location suggestions:", error);
      }
    }, 600);
  }

  function selectLocation(place) {
    const lat = Number(place.lat);
    const lon = Number(place.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

    setLocation(place.display_name || "");
    setLatitude(String(lat));
    setLongitude(String(lon));
    setMapPosition([lat, lon]);
    setSuggestions([]);
  }

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      setErrorMessage("Your browser does not support location access.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setLatitude(String(lat));
        setLongitude(String(lon));
        setMapPosition([lat, lon]);

        try {
          const response = await fetch(`${BACKEND_URL}/api/geocode`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              address: `${lat},${lon}`,
              latitude: lat,
              longitude: lon,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.displayName) setLocation(data.displayName);
          }
        } catch (error) {
          console.error("Reverse geocoding:", error);
        }
      },
      () => setErrorMessage("Allow location access or enter the address manually.")
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    setErrorMessage("");
    setSuccessMessage("");

    if (editHotel && !editHotel.id) {
      setErrorMessage("Hotel ID is missing. Open Edit from the hotel list again.");
      return;
    }

    if (!image && !existingImage) {
      setErrorMessage("Please select a cover image.");
      return;
    }

    if (
      !title.trim() ||
      !description.trim() ||
      !location.trim() ||
      latitude === "" ||
      longitude === "" ||
      price === ""
    ) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    const lat = Number(latitude);
    const lon = Number(longitude);
    const amount = Number(price);

    if (
      !Number.isFinite(lat) ||
      lat < -90 ||
      lat > 90 ||
      !Number.isFinite(lon) ||
      lon < -180 ||
      lon > 180 ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setErrorMessage("Enter valid coordinates and a price greater than zero.");
      return;
    }

    if (
      roomTypes.length === 0 ||
      roomTypes.some(
        (room) =>
          !room.type.trim() ||
          !Number.isFinite(Number(room.rooms)) ||
          Number(room.rooms) <= 0 ||
          !Number.isFinite(Number(room.guestsPerRoom)) ||
          Number(room.guestsPerRoom) <= 0
      )
    ) {
      setErrorMessage("Enter valid room types, room counts and guest capacity.");
      return;
    }

    const phone = receptionNumber.replace(/\D/g, "");
    if (!/^\d{10}$/.test(phone)) {
      setErrorMessage("Enter a valid 10-digit Indian reception number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      if (image) formData.append("image", image);

      gallery.forEach((file) => {
        formData.append("gallery", file);
        formData.append("galleryType", galleryType);
      });

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("location", location.trim());
      formData.append("highlights", highlights.trim());
      formData.append("facilities", facilities.trim());
      formData.append("latitude", String(lat));
      formData.append("longitude", String(lon));
      formData.append("price", String(amount));
      formData.append("reception_number", `+91${phone}`);

      formData.append(
        "room_types",
        JSON.stringify(
          roomTypes.map((room) => ({
            type: room.type.trim(),
            rooms: Number(room.rooms),
            guestsPerRoom: Number(room.guestsPerRoom),
          }))
        )
      );

      formData.append("breakfast_included", String(breakfastIncluded));
      formData.append("free_cancellation", String(freeCancellation));
      formData.append("pay_at_hotel", String(payAtHotel));
      formData.append("room_view", roomView);

      formData.append(
        "house_rules",
        JSON.stringify(
          houseRules
            .split(",")
            .map((rule) => rule.trim())
            .filter(Boolean)
        )
      );

      const url = editHotel ? `${API_URL}/${editHotel.id}` : API_URL;
      const response = await fetch(url, {
        method: editHotel ? "PUT" : "POST",
        body: formData,
      });

      const text = await response.text();
      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          `Backend returned a non-JSON response (HTTP ${response.status}). Check the deployed API URL.`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Could not ${editHotel ? "update" : "create"} the hotel.`
        );
      }

      setSuccessMessage(
        editHotel
          ? "Hotel details updated successfully."
          : "Hotel added successfully."
      );
    } catch (error) {
      console.error("Hotel save error:", error);
      setErrorMessage(error.message || "Unable to save the hotel.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="add-hotel-page">
      <Navbar />

      <main className="hotel-form-shell">
        <header className="hotel-form-heading">
          <span className="hotel-eyebrow">SAVI · HOSPITALITY COLLECTION</span>
          <h1>{editHotel ? "Refine Your Property" : "Create a Beautiful Stay"}</h1>
          <p>
            {editHotel
              ? "Update your property details and keep your listing fresh."
              : "Introduce your property with thoughtful details and beautiful imagery."}
          </p>
        </header>

        {errorMessage && (
          <div className="hotel-form-alert" role="alert">
            {errorMessage}
            <button type="button" onClick={() => setErrorMessage("")}>×</button>
          </div>
        )}

        {successMessage && (
          <div className="hotel-success-overlay">
            <div className="hotel-success-card">
              <div className="hotel-success-mark">✓</div>
              <h2>Beautifully Done</h2>
              <p>{successMessage}</p>
              <button type="button" onClick={() => navigate("/home")}>
                Return to hotels
              </button>
            </div>
          </div>
        )}

        <form className="hotel-form-grid" onSubmit={handleSubmit}>
          <section className="hotel-form-panel">
            <span className="hotel-section-number">01 / PRESENTATION</span>
            <h2>Make a first impression</h2>
            <p className="hotel-section-description">
              Start with beautiful imagery of your property.
            </p>

            <label className="hotel-field-label">Cover image {!editHotel && "*"}</label>
            <div className="hotel-cover-upload">
              {(image || existingImage) ? (
                <img
                  className="hotel-cover-preview"
                  src={image ? URL.createObjectURL(image) : imageUrl(existingImage)}
                  alt="Hotel cover"
                />
              ) : (
                <div className="hotel-upload-placeholder">
                  <span className="hotel-upload-symbol">✧</span>
                  <strong>Your property, beautifully presented</strong>
                  <span>Select a clear, high-quality image</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(event) => handleMainImage(event.target.files?.[0])}
              />
            </div>

            <label className="hotel-field-label">Gallery category</label>
            <select
              className="hotel-form-control"
              value={galleryType}
              onChange={(event) => setGalleryType(event.target.value)}
            >
              {["Room", "Amenities", "Reception", "Restaurant", "Swimming Pool", "Exterior", "Other"].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <label className="hotel-field-label">Add gallery photos (maximum 4 new images)</label>
            <input
              className="hotel-form-control"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                handleGalleryFiles(event.target.files);
                event.target.value = "";
              }}
            />

            {existingGallery.length > 0 && (
              <div className="hotel-gallery-grid">
                {existingGallery.map((item, index) => {
                  const src = typeof item === "string" ? item : item.image;
                  return (
                    <div className="hotel-gallery-item" key={`${src}-${index}`}>
                      <img src={imageUrl(src)} alt={item.type || `Gallery ${index + 1}`} />
                      <span>{item.type || "Gallery"}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {gallery.length > 0 && (
              <div className="hotel-gallery-grid">
                {gallery.map((file, index) => (
                  <div className="hotel-gallery-item" key={`${file.name}-${index}`}>
                    <img src={URL.createObjectURL(file)} alt={`New gallery ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => setGallery((items) => items.filter((_, i) => i !== index))}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="hotel-form-divider" />
            <span className="hotel-section-number">02 / DESTINATION</span>
            <h2>Set the scene</h2>

            <label className="hotel-field-label">Property address *</label>
            <input
              className="hotel-form-control"
              value={location}
              onChange={(event) => findLocationSuggestions(event.target.value)}
              placeholder="Search city, street or landmark"
              autoComplete="off"
              required
            />

            {suggestions.length > 0 && (
              <div className="hotel-location-suggestions">
                {suggestions.map((place) => (
                  <button
                    type="button"
                    className="hotel-location-option"
                    key={place.place_id}
                    onClick={() => selectLocation(place)}
                  >
                    {place.display_name}
                  </button>
                ))}
              </div>
            )}

            <button className="hotel-location-button" type="button" onClick={getCurrentLocation}>
              ⌖ Use my current location
            </button>

            <div className="hotel-map-frame">
              <MapContainer
                center={mapPosition}
                zoom={13}
                style={{ height: "300px", width: "100%" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater position={mapPosition} />
                <Marker position={mapPosition}>
                  <Popup>{location || "Selected property location"}</Popup>
                </Marker>
              </MapContainer>
            </div>

            <div className="hotel-two-column">
              <div>
                <label className="hotel-field-label">Latitude *</label>
                <input
                  className="hotel-form-control"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(event) => setLatitude(event.target.value)}
                  required
                />
              </div>
              <div>
                <label className="hotel-field-label">Longitude *</label>
                <input
                  className="hotel-form-control"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(event) => setLongitude(event.target.value)}
                  required
                />
              </div>
            </div>
          </section>

          <section className="hotel-form-panel">
            <span className="hotel-section-number">03 / YOUR PROPERTY</span>
            <h2>The story of your stay</h2>
            <p className="hotel-section-description">
              Tell guests what makes your property special.
            </p>

            <label className="hotel-field-label">Hotel name *</label>
            <input
              className="hotel-form-control"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. The Grand Palace"
              required
            />

            <label className="hotel-field-label">Description *</label>
            <textarea
              className="hotel-form-control hotel-textarea"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              placeholder="Describe the rooms, atmosphere and guest experience..."
              required
            />

            <label className="hotel-field-label">Highlights</label>
            <input
              className="hotel-form-control"
              value={highlights}
              onChange={(event) => setHighlights(event.target.value)}
              placeholder="Elegant rooms, city view, peaceful setting"
            />

            <label className="hotel-field-label">Facilities</label>
            <input
              className="hotel-form-control"
              value={facilities}
              onChange={(event) => setFacilities(event.target.value)}
              placeholder="Wi-Fi, parking, restaurant, swimming pool"
            />

            <div className="hotel-form-divider" />
            <span className="hotel-section-number">04 / ROOMS & RATES</span>
            <h2>Your room collection</h2>

            {roomTypes.map((room, index) => (
              <div className="hotel-room-editor" key={index}>
                <div className="hotel-room-editor-heading">
                  <strong>Room {String(index + 1).padStart(2, "0")}</strong>
                  {roomTypes.length > 1 && (
                    <button type="button" onClick={() => removeRoom(index)}>
                      Remove
                    </button>
                  )}
                </div>

                <label className="hotel-field-label">Room type *</label>
                <input
                  className="hotel-form-control"
                  value={room.type}
                  onChange={(event) => updateRoom(index, "type", event.target.value)}
                  placeholder="Deluxe Room, Suite, Family Room"
                  required
                />

                <div className="hotel-two-column">
                  <div>
                    <label className="hotel-field-label">Number of rooms *</label>
                    <input
                      className="hotel-form-control"
                      type="number"
                      min="1"
                      value={room.rooms}
                      onChange={(event) => updateRoom(index, "rooms", event.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="hotel-field-label">Guests per room *</label>
                    <input
                      className="hotel-form-control"
                      type="number"
                      min="1"
                      value={room.guestsPerRoom}
                      onChange={(event) => updateRoom(index, "guestsPerRoom", event.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}

            <button className="hotel-add-room-button" type="button" onClick={addRoom}>
              + Add another room type
            </button>

            <label className="hotel-field-label">Starting price per night (₹) *</label>
            <input
              className="hotel-form-control"
              type="number"
              min="1"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="2500"
              required
            />

            <label className="hotel-field-label">Reception number *</label>
            <div className="hotel-phone-control">
              <span>+91</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={receptionNumber}
                onChange={(event) =>
                  setReceptionNumber(
                    event.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                placeholder="9876543210"
                required
              />
            </div>

            <label className="hotel-field-label">Room view</label>
            <select
              className="hotel-form-control"
              value={roomView}
              onChange={(event) => setRoomView(event.target.value)}
            >
              <option value="">Select a view</option>
              {["City View", "Garden View", "Pool View", "Mountain View", "Sea View", "Courtyard View", "No Specific View"].map((view) => (
                <option key={view} value={view}>{view}</option>
              ))}
            </select>

            <div className="hotel-perks">
              <label>
                <input
                  type="checkbox"
                  checked={breakfastIncluded}
                  onChange={(event) => setBreakfastIncluded(event.target.checked)}
                />
                Breakfast included
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={freeCancellation}
                  onChange={(event) => setFreeCancellation(event.target.checked)}
                />
                Free cancellation
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={payAtHotel}
                  onChange={(event) => setPayAtHotel(event.target.checked)}
                />
                Pay at hotel
              </label>
            </div>

            <label className="hotel-field-label">House rules (separate with commas)</label>
            <textarea
              className="hotel-form-control"
              rows={3}
              value={houseRules}
              onChange={(event) => setHouseRules(event.target.value)}
              placeholder="Check-in after 2 PM, No smoking, Valid ID required"
            />

            <button
              className="hotel-submit-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving your property..."
                : editHotel
                ? "Update Hotel Details →"
                : "Publish Hotel →"}
            </button>

            <p className="hotel-form-footnote">
              Review your details before saving your property.
            </p>
          </section>
        </form>
      </main>
    </div>
  );
}

export default AddHotel;