import { useEffect, useState } from "react";
import { getHotels } from "../services/hotelService";
import "./HotelList.css";
import HotelCard from "../components/HotelCard";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function HotelList() {

  const getToday = () => {
    const today = new Date();

    today.setMinutes(
      today.getMinutes() - today.getTimezoneOffset()
    );

    return today.toISOString().split("T")[0];
  };
  
  const [hotels, setHotels] = useState([]);

  const availableRoomTypes = [
    ...new Set(
      hotels.flatMap((hotel) =>
        Array.isArray(hotel.room_types)
          ? hotel.room_types.map((room) => room.type)
          : []
      )
    ),
  ];

  const [searchTitle, setSearchTitle] = useState("");
  const [searchedLocation, setSearchedLocation] = useState("");

  const [minPrice, setMinPrice] = useState(1000);
  const [maxPrice, setMaxPrice] = useState(10000);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [hasSearched, setHasSearched] = useState(false);

  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  const [selectedRating, setSelectedRating] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [selectedAmenity, setSelectedAmenity] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [deleteId, setDeleteId] = useState(null);

  const [checkIn, setCheckIn] = useState(getToday());

  const [checkOut, setCheckOut] = useState(() => {
    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    tomorrow.setMinutes(
      tomorrow.getMinutes() - tomorrow.getTimezoneOffset()
    );

    return tomorrow.toISOString().split("T")[0];
  });

  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState("");

  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const [extraMattress, setExtraMattress] = useState(false);
  const [kidBreakfast, setKidBreakfast] = useState(false);

  const [breakfastIncluded, setBreakfastIncluded] = useState(false);
  const [freeCancellation, setFreeCancellation] = useState(false);
  const [payAtHotel, setPayAtHotel] = useState(false);

  const [roomView, setRoomView] = useState("");
  const [houseRule, setHouseRule] = useState("");

  const navigate = useNavigate();

  function loadHotels(
    search = "",
    min = minPrice,
    max = maxPrice,
    currentPage = 1
  ) {
    getHotels(search, min, max, currentPage)
      .then((response) => {
        setHotels(response.data.hotels);
        setTotalPages(response.data.totalPages);
      })
      .catch((error) => {
        console.log("GET HOTELS ERROR:", error);
      });
  }

  function handleSearch() {
    const searchValue = searchTitle.trim();

    setPage(1);
    setHasSearched(true);
    setSearchedLocation(searchValue);

    loadHotels(searchValue, minPrice, maxPrice, 1);
  }

  function handleUpdateSearch() {
    setPage(1);
    setHasSearched(true);
    setSearchedLocation(searchTitle.trim());

    loadHotels(
      searchTitle.trim(),
      minPrice,
      maxPrice,
      1
    );
  }

  function handleEdit(hotel) {
    navigate("/add-hotel", {
      state: {
        hotel: hotel,
      },
    });
  }

  function handleDelete(id) {
    setDeleteId(id);
  }

  async function confirmDelete() {
    try {
      await axios.delete(
  `https://savi-hotel-backend.onrender.com/api/hotels/${deleteId}`
);
      setHotels((currentHotels) =>
        currentHotels.filter(
          (hotel) => hotel.id !== deleteId
        )
      );

      setDeleteId(null);
      setSuccessMessage("Hotel deleted successfully!");
    } catch (error) {
      console.log("DELETE ERROR:", error);

      setDeleteId(null);
      alert("Failed to delete hotel");
    }
  }

  function applySort(hotelList) {
    const sortedHotels = [...hotelList];

    if (sortBy === "price-low") {
      sortedHotels.sort(
        (a, b) => Number(a.price) - Number(b.price)
      );
    }

    if (sortBy === "price-high") {
      sortedHotels.sort(
        (a, b) => Number(b.price) - Number(a.price)
      );
    }

    if (sortBy === "rating") {
      sortedHotels.sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      );
    }

    if (sortBy === "review") {
      sortedHotels.sort(
        (a, b) =>
          Number(b.review_count || 0) -
          Number(a.review_count || 0)
      );
    }

    return sortedHotels;
  }

  function clearFilters() {
    setBreakfastIncluded(false);
    setFreeCancellation(false);
    setPayAtHotel(false);

    setMinPrice(1000);
    setMaxPrice(10000);

    setSortBy("popular");

    setRoomView("");

    setHouseRule("");

    setPage(1);

    loadHotels(
      searchedLocation,
      1000,
      10000,
      1
    );
  }

  function handleApplyFilters() {
    setPage(1);

    loadHotels(
      searchedLocation,
      minPrice,
      maxPrice,
      1
    );
  }

  function formatDate(date) {
    if (!date) {
      return "Select date";
    }

    const selectedDate = new Date(date);

    if (Number.isNaN(selectedDate.getTime())) {
      return date;
    }

    return selectedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function isEnabled(value) {
    if (value === true) {
      return true;
    }

    if (value === false || value === null || value === undefined) {
      return false;
    }

    return (
      value === "true" ||
      value === "yes" ||
      value === "Yes" ||
      value === "included" ||
      value === "Included" ||
      value === 1
    );
  }

  function getRoomViewValue(hotel) {
    if (hotel.room_view) {
      return hotel.room_view;
    }

    if (hotel.roomView) {
      return hotel.roomView;
    }

    return "";
  }

  function getHouseRules(hotel) {
    if (Array.isArray(hotel.house_rules)) {
      return hotel.house_rules;
    }

    if (Array.isArray(hotel.houseRules)) {
      return hotel.houseRules;
    }

    if (typeof hotel.house_rules === "string") {
      return hotel.house_rules
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (typeof hotel.houseRules === "string") {
      return hotel.houseRules
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  }

  useEffect(() => {
    loadHotels("", 1000, 10000, 1);
  }, []);

  useEffect(() => {
    loadHotels(
      hasSearched ? searchedLocation : "",
      minPrice,
      maxPrice,
      page
    );
  }, [page]);

  const sortedHotels = applySort(hotels);

  const availableHotels = sortedHotels.filter((hotel) => {
    if (!Array.isArray(hotel.room_types)) {
      return false;
    }

    const totalGuests = adults + children;

    const matchingRooms = selectedRoomType
      ? hotel.room_types.filter(
          (room) => room.type === selectedRoomType
        )
      : hotel.room_types;

    return matchingRooms.some((room) => {
      const availableRooms = Number(room.rooms || 0);
      const guestsPerRoom = Number(
        room.guestsPerRoom || 0
      );

      if (availableRooms < rooms) {
        return false;
      }

      const totalCapacity =
        rooms * guestsPerRoom;

      return totalCapacity >= totalGuests;
    });
  });

  const filteredHotels = availableHotels.filter((hotel) => {
    if (
      breakfastIncluded &&
      !isEnabled(hotel.breakfast_included)
    ) {
      return false;
    }

    if (
      freeCancellation &&
      !isEnabled(hotel.free_cancellation)
    ) {
      return false;
    }

    if (
      payAtHotel &&
      !isEnabled(hotel.pay_at_hotel)
    ) {
      return false;
    }

    if (roomView) {
      const hotelRoomView = getRoomViewValue(hotel);

      if (hotelRoomView !== roomView) {
        return false;
      }
    }

    if (houseRule) {
      const rules = getHouseRules(hotel);

      if (!rules.includes(houseRule)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="hotel-page">

      {deleteId && (
        <div className="popup-overlay">
          <div className="delete-popup-box">

            <div className="delete-icon">
              !
            </div>

            <h3>Delete Hotel?</h3>

            <p>
              Are you sure you want to delete this hotel?
            </p>

            <div className="popup-actions">

              <button
                className="cancel-btn"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>

              <button
                className="delete-confirm-btn"
                onClick={confirmDelete}
              >
                Delete
              </button>

            </div>

          </div>
        </div>
      )}

      {successMessage && (
        <div className="popup-overlay">
          <div className="success-popup-box">

            <div className="success-icon">
              ✓
            </div>

            <h3>Success!</h3>

            <p>{successMessage}</p>

            <button
              onClick={() => setSuccessMessage("")}
            >
              OK
            </button>

          </div>
        </div>
      )}

      {!hasSearched && (
        <div className="hero">

          <img
            src="/herocard.jpg"
            alt="Beautiful beach destination"
            className="hero-image"
          />

          <div className="hero-navbar">
            <Navbar />
          </div>

          <div className="hero-overlay">

            <h1>
              Discover places that feel worth the journey.
            </h1>

            <p>
              For stays that become stories.
            </p>

            <div className="search-box">

              <input
                type="text"
                placeholder="Search location or hotel name..."
                value={searchTitle}
                onChange={(e) =>
                  setSearchTitle(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />

              <button onClick={handleSearch}>
                Search
              </button>

            </div>

          </div>

        </div>
      )}

      {hasSearched && (
        <div className="results-navbar">
          <Navbar />
        </div>
      )}

      {hasSearched && (
        <div className="booking-search-bar">

          <div className="booking-field location-field">
            <span>
              AREA, LANDMARK OR PROPERTY NAME
            </span>

            <strong>
              {searchedLocation}
            </strong>
          </div>

          <div className="booking-field">

            <span>CHECK-IN</span>

            <input
              type="date"
              min={getToday()}
              value={checkIn}
              onChange={(e) => {
                const newCheckIn = e.target.value;

                setCheckIn(newCheckIn);

                if (checkOut <= newCheckIn) {
                  const nextDay = new Date(newCheckIn);

                  nextDay.setDate(
                    nextDay.getDate() + 1
                  );

                  const nextDayString =
                    nextDay.toISOString().split("T")[0];

                  setCheckOut(nextDayString);
                }
              }}
            />

          </div>

          <div className="booking-field">

            <span>CHECK-OUT</span>

            <input
              type="date"
              min={(() => {
                const nextDay = new Date(checkIn);

                nextDay.setDate(
                  nextDay.getDate() + 1
                );

                return nextDay.toISOString().split("T")[0];
              })()}
              value={checkOut}
              onChange={(e) =>
                setCheckOut(e.target.value)
              }
            />

          </div>

          <div className="booking-field guest-field">

            <span>GUEST & ROOMS</span>

            <button
              type="button"
              className="guest-summary"
              onClick={() => {
                console.log("GUEST CLICKED");
                setShowGuestDropdown(true);
              }}
            >
              {adults} Adults · {rooms} Room
            </button>

            {showGuestDropdown && (
              <div className="guest-dropdown">

                <div className="booking-field room-preference-field">

                  <span>ROOM PREFERENCE</span>

                  <select
                    value={selectedRoomType}
                    onChange={(e) =>
                      setSelectedRoomType(e.target.value)
                    }
                  >
                    <option value="">
                      Any Room Type
                    </option>

                    {availableRoomTypes.map((type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    ))}

                  </select>

                </div>

                <div className="guest-row">

                  <div>
                    <strong>Rooms</strong>
                    <small>Max 20</small>
                  </div>

                  <div className="counter">

                    <button
                      type="button"
                      onClick={() =>
                        setRooms(
                          Math.max(1, rooms - 1)
                        )
                      }
                    >
                      −
                    </button>

                    <span>{rooms}</span>

                    <button
                      type="button"
                      onClick={() =>
                        setRooms(
                          Math.min(20, rooms + 1)
                        )
                      }
                    >
                      +
                    </button>

                  </div>

                </div>

                <div className="guest-row">

                  <div>
                    <strong>Adults</strong>
                    <small>17+ yr</small>
                  </div>

                  <div className="counter">

                    <button
                      type="button"
                      onClick={() =>
                        setAdults(
                          Math.max(1, adults - 1)
                        )
                      }
                    >
                      −
                    </button>

                    <span>{adults}</span>

                    <button
                      type="button"
                      onClick={() =>
                        setAdults(adults + 1)
                      }
                    >
                      +
                    </button>

                  </div>

                </div>

                <div className="guest-row">

                  <div>
                    <strong>Children</strong>
                    <small>0–17 yr</small>
                  </div>

                  <div className="counter">

                    <button
                      type="button"
                      onClick={() =>
                        setChildren(
                          Math.max(
                            0,
                            children - 1
                          )
                        )
                      }
                    >
                      −
                    </button>

                    <span>{children}</span>

                    <button
                      type="button"
                      onClick={() =>
                        setChildren(
                          children + 1
                        )
                      }
                    >
                      +
                    </button>

                  </div>

                </div>

                <div className="children-info">

                  <strong>
                    Travelling with children?
                  </strong>

                  <p>
                    If you are travelling with children,
                    add number of children and their age
                    to get the best rooms options,
                    prices etc.
                  </p>

                </div>

                <label className="guest-option">

                  <input
                    type="checkbox"
                    checked={extraMattress}
                    onChange={(e) =>
                      setExtraMattress(
                        e.target.checked
                      )
                    }
                  />

                  Extra Mattress

                </label>

                <label className="guest-option">

                  <input
                    type="checkbox"
                    checked={kidBreakfast}
                    onChange={(e) =>
                      setKidBreakfast(
                        e.target.checked
                      )
                    }
                  />

                  Kid Breakfast Inclusive plans

                </label>

                <button
                  type="button"
                  className="guest-done-btn"
                  onClick={() =>
                    setShowGuestDropdown(false)
                  }
                >
                  Done
                </button>

              </div>
            )}

          </div>

          <button
            className="update-search-btn"
            onClick={handleUpdateSearch}
          >
            UPDATE SEARCH
          </button>

        </div>
      )}

      {!hasSearched && (
        <div className="stay-collection-header">

          <span className="stay-collection-label">
            A Curated Selection
          </span>

          <h2>
            The Stay Collection
          </h2>

          <div className="stay-collection-line"></div>

          <p>
            Thoughtfully chosen. Meant to be remembered.
          </p>

        </div>
      )}

      {hasSearched && (
        <div className="filter-mobile-button">
        </div>
      )}

      <div className="hotel-results-section">

        {hasSearched && (
          <aside
            className={`hotel-filters ${
              showFilters ? "show" : ""
            }`}
          >

            <div className="filter-header">

              <h3>FILTERS</h3>

              <button onClick={clearFilters}>
                CLEAR
              </button>

            </div>

            <div className="filter-group">

              <h4>Popular filters</h4>

              <label>

                <input
                  type="checkbox"
                  checked={breakfastIncluded}
                  onChange={(e) =>
                    setBreakfastIncluded(
                      e.target.checked
                    )
                  }
                />

                <span>
                  Breakfast included
                </span>

              </label>

              <label>

                <input
                  type="checkbox"
                  checked={freeCancellation}
                  onChange={(e) =>
                    setFreeCancellation(
                      e.target.checked
                    )
                  }
                />

                <span>
                  Free cancellation
                </span>

              </label>

              <label>

                <input
                  type="checkbox"
                  checked={payAtHotel}
                  onChange={(e) =>
                    setPayAtHotel(
                      e.target.checked
                    )
                  }
                />

                <span>
                  Pay at hotel
                </span>

              </label>

            </div>

            <div className="filter-group">

              <h4>Price</h4>

              <div className="price-filter">

                <div className="price-filter-header">

                  <span>
                    Price Range
                  </span>

                  <span className="price-values">

                    ₹{Number(
                      minPrice
                    ).toLocaleString("en-IN")}

                    {" — "}

                    ₹{Number(
                      maxPrice
                    ).toLocaleString("en-IN")}

                  </span>

                </div>

                <div className="price-slider">

                  <input
                    type="range"
                    min="1000"
                    max="10000"
                    step="500"
                    value={minPrice}
                    onChange={(e) =>
                      setMinPrice(
                        Math.min(
                          Number(e.target.value),
                          maxPrice
                        )
                      )
                    }
                  />

                  <input
                    type="range"
                    min="1000"
                    max="10000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) =>
                      setMaxPrice(
                        Math.max(
                          Number(e.target.value),
                          minPrice
                        )
                      )
                    }
                  />

                </div>

                <div className="price-slider-labels">

                  <span>
                    ₹1,000
                  </span>

                  <span>
                    ₹10,000
                  </span>

                </div>

              </div>

            </div>

            <div className="filter-group">

              <h4>Sort By</h4>

              <select
                className="filter-sort-select"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
              >

                <option value="popular">
                  Most popular
                </option>

                <option value="price-low">
                  Price - Low to high
                </option>

                <option value="price-high">
                  Price - High to low
                </option>

                <option value="rating">
                  Goibibo Ratings - Highest First
                </option>

                <option value="review">
                  Most & Best Reviewed
                </option>

              </select>

            </div>

            <div className="filter-group">

              <h4>Room Views</h4>

              <label>

                <input
                  type="checkbox"
                  checked={roomView === "City View"}
                  onChange={(e) =>
                    setRoomView(
                      e.target.checked
                        ? "City View"
                        : ""
                    )
                  }
                />

                City View

              </label>

              <label>

                <input
                  type="checkbox"
                  checked={roomView === "Garden View"}
                  onChange={(e) =>
                    setRoomView(
                      e.target.checked
                        ? "Garden View"
                        : ""
                    )
                  }
                />

                Garden View

              </label>

              <label>

                <input
                  type="checkbox"
                  checked={roomView === "Pool View"}
                  onChange={(e) =>
                    setRoomView(
                      e.target.checked
                        ? "Pool View"
                        : ""
                    )
                  }
                />

                Pool View

              </label>

            </div>

            <div className="filter-group">

              <h4>House Rules</h4>

              <label>

                <input
                  type="checkbox"
                  checked={
                    houseRule === "Couple Friendly"
                  }
                  onChange={(e) =>
                    setHouseRule(
                      e.target.checked
                        ? "Couple Friendly"
                        : ""
                    )
                  }
                />

                Couple Friendly

              </label>

              <label>

                <input
                  type="checkbox"
                  checked={
                    houseRule === "Pet Friendly"
                  }
                  onChange={(e) =>
                    setHouseRule(
                      e.target.checked
                        ? "Pet Friendly"
                        : ""
                    )
                  }
                />

                Pet Friendly

              </label>

            </div>

            <button
              className="all-filters-apply-btn"
              onClick={handleApplyFilters}
            >
              Apply Filters
            </button>

          </aside>
        )}

        <div
          style={{
            width: "100%",
            display: "block",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >

          {filteredHotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}

        </div>

      </div>

      <div className="pagination">

        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>

        {Array.from(
          { length: totalPages },
          (_, index) => (
            <button
              key={index + 1}
              className={
                page === index + 1
                  ? "active"
                  : ""
              }
              onClick={() =>
                setPage(index + 1)
              }
            >
              {index + 1}
            </button>
          )
        )}

        <button
          disabled={page === totalPages}
          onClick={() =>
            setPage(page + 1)
          }
        >
          Next
        </button>

      </div>

    </div>
  );
}

export default HotelList;