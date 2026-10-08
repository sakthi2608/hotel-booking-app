
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [rooms, setRooms] = useState(1);

  const handleSearch = () => {
    if (!location.trim()) {
      alert("Please enter hotel name or location");
      return;
    }

    navigate(
      `/hotels?location=${encodeURIComponent(location)}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&rooms=${rooms}`
    );
  };

  return (
    <div>
      <h1>Find your perfect stay</h1>

      <div>
        <label>AREA, LANDMARK OR PROPERTY NAME</label>
        <input
          type="text"
          placeholder="Search hotel or location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div>
        <label>CHECK-IN</label>
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
        />
      </div>

      <div>
        <label>CHECK-OUT</label>
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
        />
      </div>

      <div>
        <label>GUEST & ROOMS</label>

        <select
          value={adults}
          onChange={(e) => setAdults(e.target.value)}
        >
          <option value="1">1 Adult</option>
          <option value="2">2 Adults</option>
          <option value="3">3 Adults</option>
          <option value="4">4 Adults</option>
        </select>

        <select
          value={rooms}
          onChange={(e) => setRooms(e.target.value)}
        >
          <option value="1">1 Room</option>
          <option value="2">2 Rooms</option>
          <option value="3">3 Rooms</option>
          <option value="4">4 Rooms</option>
        </select>
      </div>

      <button onClick={handleSearch}>SEARCH</button>
    </div>
  );
}

export default Home;

