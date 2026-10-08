import { useEffect, useState } from "react";
import { getHotels } from "../services/hotelService";
import "./Hotels.css";
import HotelCard from "../components/HotelCard";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Hotels() {
  const [hotels, setHotels] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadHotels();
  }, []);

  function loadHotels() {
    getHotels("", 1000, 10000, 1)
      .then((response) => {
        setHotels(response.data.hotels || []);
      })
      .catch((error) => {
        console.log("GET HOTELS ERROR:", error);
      });
  }

  function handleView(hotel) {
    navigate(`/hotel/${hotel.id}`);
  }

  return (
    <div className="hotels-page">

      <Navbar />

      <div className="hotels-list">

        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            className="hotel-view-wrapper"
            onClick={() => handleView(hotel)}
          >
            <HotelCard
              hotel={hotel}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </div>
        ))}

      </div>

    </div>
  );
}

export default Hotels;
