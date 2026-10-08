
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useNavigate } from "react-router-dom";
import "./HotelDetails.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomCount, setRoomCount] = useState(1);
  const [adultCount, setAdultCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [roomPreferenceDone, setRoomPreferenceDone] = useState(false);

  useEffect(() => {
      fetch(`https://savi-hotel-backend.onrender.com/api/hotels/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setHotel(data);

        if (Array.isArray(data.room_types) && data.room_types.length > 0) {
          setSelectedRoom(data.room_types[0]);
        }
      })
      .catch((error) => {
        console.log("HOTEL DETAILS ERROR:", error);
      });
  }, [id]);

  if (!hotel) {
    return (
      <div className="hotel-loading">
        Loading hotel details...
      </div>
    );
  }

  const hotelImage = hotel.image;

  const roomTypes = Array.isArray(hotel.room_types)
    ? hotel.room_types
    : [];

  const roomPrice = selectedRoom
    ? Number(selectedRoom.price || hotel.price || 0)
    : Number(hotel.price || 0);

  const totalPrice = roomPrice * roomCount;

  const maxRooms = selectedRoom
    ? Number(selectedRoom.rooms || 20)
    : 20;

  const maxAdults = selectedRoom
    ? Number(selectedRoom.guestsPerRoom || 2) * roomCount
    : 20;

  return (
    <div>
      <Navbar />

      <div className="hotel-details-page">

        <div className="details-breadcrumb">
          <span onClick={() => navigate("/")}>Home</span>
          <span>›</span>
          <span onClick={() => navigate("/hotels")}>Hotels</span>
          <span>›</span>
          <strong>{hotel.title}</strong>
        </div>

        <div className="hotel-gallery">

          <div className="main-hotel-image">
            <img
              src={hotelImage}
              alt={hotel.title}
            />
          </div>

          <div className="small-hotel-images">

            {Array.isArray(hotel.gallery) &&
              hotel.gallery.map((item, index) => {
                const image =
                  typeof item === "string"
                    ? item
                    : item.image;

                const type =
                  typeof item === "string"
                    ? ["Room", "Amenities", "Reception", "Dining"][index] || "Gallery"
                    : item.type || "Gallery";

                return (
                  <div className="small-image" key={index}>
                    <img
                      src={image}
                      alt={`${hotel.title} ${type}`}
                    />
                    <span>{type}</span>
                  </div>
                );
              })}

          </div>
        </div>

        <div className="hotel-main-info">

          <div className="hotel-info-left">

            <h1>{hotel.title}</h1>

            <p className="hotel-address">
              📍 {hotel.location}
            </p>

            <p className="hotel-description">
              {hotel.description}
            </p>

          </div>

          <div className="booking-card">

            <p>Price per night</p>

            <h2>₹{hotel.price}</h2>

            <div className="room-preference">

              <h3>ROOM PREFERENCE</h3>

              <div className="room-preference-section">

                <label>Room Type</label>

                <select
                  value={selectedRoom?.type || ""}
                  onChange={(e) => {
                    const room = roomTypes.find(
                      (item) => item.type === e.target.value
                    );

                    setSelectedRoom(room);
                    setRoomCount(1);
                    setAdultCount(
                      Number(room?.guestsPerRoom || 2)
                    );
                    setRoomPreferenceDone(false);
                  }}
                >
                  {roomTypes.length > 0 ? (
                    roomTypes.map((room, index) => (
                      <option
                        key={index}
                        value={room.type}
                      >
                        {room.type}
                      </option>
                    ))
                  ) : (
                    <option value="">
                      Standard Room
                    </option>
                  )}
                </select>

              </div>

              <div className="room-preference-section">

                <label>Rooms</label>

                <div className="counter-row">

                  <button
                    type="button"
                    onClick={() => {
                      setRoomCount((current) =>
                        Math.max(1, current - 1)
                      );
                      setRoomPreferenceDone(false);
                    }}
                  >
                    −
                  </button>

                  <span>{roomCount}</span>

                  <button
                    type="button"
                    onClick={() => {
                      setRoomCount((current) =>
                        Math.min(maxRooms, current + 1)
                      );
                      setRoomPreferenceDone(false);
                    }}
                  >
                    +
                  </button>

                </div>

                <small>
                  Max {maxRooms}
                </small>

              </div>

              <div className="room-preference-section">

                <label>Adults</label>

                <div className="counter-row">

                  <button
                    type="button"
                    onClick={() => {
                      setAdultCount((current) =>
                        Math.max(1, current - 1)
                      );
                      setRoomPreferenceDone(false);
                    }}
                  >
                    −
                  </button>

                  <span>{adultCount}</span>

                  <button
                    type="button"
                    onClick={() => {
                      setAdultCount((current) =>
                        Math.min(maxAdults, current + 1)
                      );
                      setRoomPreferenceDone(false);
                    }}
                  >
                    +
                  </button>

                </div>

                <small>17+ yr</small>

              </div>

              <div className="room-preference-section">

                <label>Children</label>

                <div className="counter-row">

                  <button
                    type="button"
                    onClick={() => {
                      setChildrenCount((current) =>
                        Math.max(0, current - 1)
                      );
                      setRoomPreferenceDone(false);
                    }}
                  >
                    −
                  </button>

                  <span>{childrenCount}</span>

                  <button
                    type="button"
                    onClick={() => {
                      setChildrenCount((current) =>
                        current + 1
                      );
                      setRoomPreferenceDone(false);
                    }}
                  >
                    +
                  </button>

                </div>

                <small>0–17 yr</small>

              </div>

              <div className="children-info">

                <strong>Travelling with children?</strong>

                <p>
                  If you are travelling with children, add
                  number of children and their age to get the
                  best rooms options, prices etc.
                </p>

              </div>

              {roomPreferenceDone && (
                <div className="selected-room-summary">

                  <div>
                    <span>Room</span>
                    <strong>
                      {selectedRoom?.type || "Room"}
                    </strong>
                  </div>

                  <div>
                    <span>Rooms</span>
                    <strong>{roomCount}</strong>
                  </div>

                  <div>
                    <span>Adults</span>
                    <strong>{adultCount}</strong>
                  </div>

                  <div>
                    <span>Children</span>
                    <strong>{childrenCount}</strong>
                  </div>

                  <div className="total-price-row">
                    <span>Total Price</span>
                    <strong>₹{totalPrice.toLocaleString("en-IN")}</strong>
                  </div>

                  <p className="price-note">
                    ₹{roomPrice.toLocaleString("en-IN")} ×{" "}
                    {roomCount} room
                    {roomCount > 1 ? "s" : ""} / night
                  </p>

                </div>
              )}

              <button
                type="button"
                className="room-done-button"
                onClick={() => {
                  setRoomPreferenceDone(true);
                }}
              >
                Done
              </button>

            </div>

            

          </div>

        </div>

        <div className="details-content">

          <div className="details-left">

            <section>
              <h2>Overview</h2>

              <p className="overview-text">
                {hotel.description}
              </p>
            </section>

            <section>
              <h2>Amenities</h2>

              <div className="amenities-grid">
                {Array.isArray(hotel.facilities) &&
                  hotel.facilities.map((facility, index) => (
                    <div key={index}>
                      {facility}
                    </div>
                  ))}
              </div>

              <div className="hotel-contact">
                <span>Reception</span>
                <strong>{hotel.reception_number}</strong>
              </div>

            </section>

          </div>

          <aside className="details-right">

            <div className="location-card">

              <h2>Location</h2>

              <p className="location-address">
                📍 {hotel.location}
              </p>

              <div className="hotel-map">

                <MapContainer
                  center={[
                    Number(hotel.latitude),
                    Number(hotel.longitude),
                  ]}
                  zoom={15}
                  style={{
                    height: "100%",
                    width: "100%",
                  }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <Marker
                    position={[
                      Number(hotel.latitude),
                      Number(hotel.longitude),
                    ]}
                  >
                    <Popup>
                      {hotel.title}
                    </Popup>
                  </Marker>
                </MapContainer>

              </div>

            </div>

          </aside>

        </div>

      </div>
    </div>
  );
}

export default HotelDetails;
