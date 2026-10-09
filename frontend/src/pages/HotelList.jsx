
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
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split("T")[0];
  };

  const [hotels, setHotels] = useState([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchedLocation, setSearchedLocation] = useState("");
  const [minPrice, setMinPrice] = useState(1000);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
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

  const availableRoomTypes = [
    ...new Set(
      hotels.flatMap((hotel) =>
        Array.isArray(hotel.room_types)
          ? hotel.room_types
              .map((room) =>
                typeof room === "string" ? room : room?.type
              )
              .filter(Boolean)
          : []
      )
    ),
  ];

  function loadHotels(
    search = "",
    min = minPrice,
    max = maxPrice,
    currentPage = 1
  ) {
    getHotels(search, min, max, currentPage)
      .then((response) => {
        const hotelData = response.data?.hotels;
        setHotels(Array.isArray(hotelData) ? hotelData : []);
        setTotalPages(
          Math.max(1, Number(response.data?.totalPages) || 1)
        );
      })
      .catch((error) => {
        console.error("GET HOTELS ERROR:", error);
        setHotels([]);
        setTotalPages(1);
      });
  }

  useEffect(() => {
    loadHotels("", 0, 1000000, page);
  }, [page]);

  function handleSearch() {
    const searchValue = searchTitle.trim();

    setPage(1);
    setHasSearched(true);
    setSearchedLocation(searchValue);
    loadHotels(searchValue, minPrice, maxPrice, 1);
  }

  function handleUpdateSearch() {
    const searchValue = searchTitle.trim();

    setPage(1);
    setHasSearched(true);
    setSearchedLocation(searchValue);
    loadHotels(searchValue, minPrice, maxPrice, 1);
  }

  function handleEdit(hotel) {
    navigate("/add-hotel", {
      state: { hotel },
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
        currentHotels.filter((hotel) => hotel.id !== deleteId)
      );

      setDeleteId(null);
      setSuccessMessage("Hotel deleted successfully!");
    } catch (error) {
      console.error("DELETE ERROR:", error);
      setDeleteId(null);
      alert("Failed to delete hotel");
    }
  }

  function applySort(hotelList) {
    const sortedHotels = [...hotelList];

    if (sortBy === "price-low") {
      sortedHotels.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sortBy === "price-high") {
      sortedHotels.sort((a, b) => Number(b.price) - Number(a.price));
    }

    if (sortBy === "rating") {
      sortedHotels.sort(
        (a, b) => Number(b.rating || 0) - Number(a.rating || 0)
      );
    }

    if (sortBy === "review") {
      sortedHotels.sort(
        (a, b) =>
          Number(b.review_count || 0) - Number(a.review_count || 0)
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

    loadHotels(searchedLocation, 1000, 10000, 1);
  }

  function handleApplyFilters() {
    setPage(1);
    loadHotels(searchedLocation, minPrice, maxPrice, 1);
  }

  function isEnabled(value) {
    if (value === true || value === 1) return true;
    if (value === false || value == null) return false;

    return ["true", "yes", "Yes", "included", "Included"].includes(value);
  }

  function getRoomViewValue(hotel) {
    return hotel.room_view || hotel.roomView || "";
  }

  function getHouseRules(hotel) {
    const rules = hotel.house_rules ?? hotel.houseRules;

    if (Array.isArray(rules)) return rules;

    if (typeof rules === "string") {
      return rules.split(",").map((item) => item.trim()).filter(Boolean);
    }

    return [];
  }

  const sortedHotels = applySort(hotels);

  const availableHotels = sortedHotels.filter((hotel) => {
    // Home page: show hotels even if room information is missing.
    if (!hasSearched) return true;

    const roomTypes = Array.isArray(hotel.room_types)
      ? hotel.room_types
      : [];

    // Do not hide a hotel just because its room data is absent.
    if (roomTypes.length === 0) return true;

    const totalGuests = Number(adults) + Number(children);

    const matchingRooms = selectedRoomType
      ? roomTypes.filter((room) =>
          typeof room === "string"
            ? room === selectedRoomType
            : room?.type === selectedRoomType
        )
      : roomTypes;

    return matchingRooms.some((room) => {
      if (typeof room === "string") return true;

      const availableRooms = Number(
        room.rooms ?? room.availableRooms ?? 0
      );

      const guestsPerRoom = Number(
        room.guestsPerRoom ?? room.guests_per_room ?? 0
      );

      return (
        availableRooms >= Number(rooms) &&
        Number(rooms) * guestsPerRoom >= totalGuests
      );
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

    if (payAtHotel && !isEnabled(hotel.pay_at_hotel)) {
      return false;
    }

    if (roomView && getRoomViewValue(hotel) !== roomView) {
      return false;
    }

    if (houseRule && !getHouseRules(hotel).includes(houseRule)) {
      return false;
    }

    return true;
  });

  return (
    <div className="hotel-page">
      {deleteId !== null && (
        <div className="popup-overlay">
          <div className="delete-popup-box">
            <div className="delete-icon">!</div>
            <h3>Delete Hotel?</h3>
            <p>Are you sure you want to delete this hotel?</p>

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
            <div className="success-icon">✓</div>
            <h3>Success!</h3>
            <p>{successMessage}</p>
            <button onClick={() => setSuccessMessage("")}>OK</button>
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
            <h1>Discover places that feel worth the journey.</h1>
            <p>For stays that become stories.</p>

            <div className="search-box">
              <input
                type="text"
                placeholder="Search location or hotel name..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />

              <button onClick={handleSearch}>Search</button>
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
            <span>AREA, LANDMARK OR PROPERTY NAME</span>
            <strong>{searchedLocation}</strong>
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
                  nextDay.setDate(nextDay.getDate() + 1);
                  nextDay.setMinutes(
                    nextDay.getMinutes() - nextDay.getTimezoneOffset()
                  );
                  setCheckOut(nextDay.toISOString().split("T")[0]);
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
                nextDay.setDate(nextDay.getDate() + 1);
                nextDay.setMinutes(
                  nextDay.getMinutes() - nextDay.getTimezoneOffset()
                );
                return nextDay.toISOString().split("T")[0];
              })()}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>

          <div className="booking-field guest-field">
            <span>GUEST &amp; ROOMS</span>
            <button
              type="button"
              className="guest-summary"
              onClick={() => setShowGuestDropdown((shown) => !shown)}
            >
              {adults} Adults · {rooms} Room
            </button>

            {showGuestDropdown && (
              <div className="guest-dropdown">
                <div className="booking-field room-preference-field">
                  <span>ROOM PREFERENCE</span>
                  <select
                    value={selectedRoomType}
                    onChange={(e) => setSelectedRoomType(e.target.value)}
                  >
                    <option value="">Any Room Type</option>
                    {availableRoomTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {[
                  {
                    label: "Rooms",
                    detail: "Max 20",
                    value: rooms,
                    decrease: () => setRooms((value) => Math.max(1, value - 1)),
                    increase: () => setRooms((value) => Math.min(20, value + 1)),
                  },
                  {
                    label: "Adults",
                    detail: "17+ yr",
                    value: adults,
                    decrease: () => setAdults((value) => Math.max(1, value - 1)),
                    increase: () => setAdults((value) => value + 1),
                  },
                  {
                    label: "Children",
                    detail: "0–17 yr",
                    value: children,
                    decrease: () =>
                      setChildren((value) => Math.max(0, value - 1)),
                    increase: () => setChildren((value) => value + 1),
                  },
                ].map((item) => (
                  <div className="guest-row" key={item.label}>
                    <div>
                      <strong>{item.label}</strong>
                      <small>{item.detail}</small>
                    </div>

                    <div className="counter">
                      <button type="button" onClick={item.decrease}>
                        −
                      </button>
                      <span>{item.value}</span>
                      <button type="button" onClick={item.increase}>
                        +
                      </button>
                    </div>
                  </div>
                ))}

                <div className="children-info">
                  <strong>Travelling with children?</strong>
                  <p>
                    Add the number of children to help find suitable room
                    options and prices.
                  </p>
                </div>

                <label className="guest-option">
                  <input
                    type="checkbox"
                    checked={extraMattress}
                    onChange={(e) => setExtraMattress(e.target.checked)}
                  />
                  Extra Mattress
                </label>

                <label className="guest-option">
                  <input
                    type="checkbox"
                    checked={kidBreakfast}
                    onChange={(e) => setKidBreakfast(e.target.checked)}
                  />
                  Kid Breakfast Inclusive plans
                </label>

                <button
                  type="button"
                  className="guest-done-btn"
                  onClick={() => setShowGuestDropdown(false)}
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
          <span className="stay-collection-label">A Curated Selection</span>
          <h2>The Stay Collection</h2>
          <div className="stay-collection-line"></div>
          <p>Thoughtfully chosen. Meant to be remembered.</p>
        </div>
      )}

      {hasSearched && (
        <div className="filter-mobile-button">
          <button onClick={() => setShowFilters((shown) => !shown)}>
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      )}

      <div className="hotel-results-section">
        {hasSearched && (
          <aside className={`hotel-filters ${showFilters ? "show" : ""}`}>
            <div className="filter-header">
              <h3>FILTERS</h3>
              <button onClick={clearFilters}>CLEAR</button>
            </div>

            <div className="filter-group">
              <h4>Popular filters</h4>

              <label>
                <input
                  type="checkbox"
                  checked={breakfastIncluded}
                  onChange={(e) => setBreakfastIncluded(e.target.checked)}
                />
                <span>Breakfast included</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={freeCancellation}
                  onChange={(e) => setFreeCancellation(e.target.checked)}
                />
                <span>Free cancellation</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={payAtHotel}
                  onChange={(e) => setPayAtHotel(e.target.checked)}
                />
                <span>Pay at hotel</span>
              </label>
            </div>

            <div className="filter-group">
              <h4>Price</h4>

              <div className="price-filter">
                <div className="price-filter-header">
                  <span>Price Range</span>
                  <span className="price-values">
                    ₹{Number(minPrice).toLocaleString("en-IN")}
                    {" — "}
                    ₹{Number(maxPrice).toLocaleString("en-IN")}
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
                        Math.min(Number(e.target.value), maxPrice)
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
                        Math.max(Number(e.target.value), minPrice)
                      )
                    }
                  />
                </div>

                <div className="price-slider-labels">
                  <span>₹1,000</span>
                  <span>₹10,000</span>
                </div>
              </div>
            </div>

            <div className="filter-group">
              <h4>Sort By</h4>
              <select
                className="filter-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popular">Most popular</option>
                <option value="price-low">Price - Low to high</option>
                <option value="price-high">Price - High to low</option>
                <option value="rating">Goibibo Ratings - Highest First</option>
                <option value="review">Most &amp; Best Reviewed</option>
              </select>
            </div>

            <div className="filter-group">
              <h4>Room Views</h4>

              {["City View", "Garden View", "Pool View"].map((view) => (
                <label key={view}>
                  <input
                    type="checkbox"
                    checked={roomView === view}
                    onChange={(e) =>
                      setRoomView(e.target.checked ? view : "")
                    }
                  />
                  {view}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h4>House Rules</h4>

              {["Couple Friendly", "Pet Friendly"].map((rule) => (
                <label key={rule}>
                  <input
                    type="checkbox"
                    checked={houseRule === rule}
                    onChange={(e) =>
                      setHouseRule(e.target.checked ? rule : "")
                    }
                  />
                  {rule}
                </label>
              ))}
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
          {filteredHotels.length > 0 ? (
            filteredHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <p style={{ textAlign: "center", padding: "30px" }}>
              {hasSearched
                ? "No hotels match your search or filters."
                : "Loading hotels..."}
            </p>
          )}
        </div>
      </div>

      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage((current) => current - 1)}
        >
          Previous
        </button>

        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={page === index + 1 ? "active" : ""}
            onClick={() => setPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}

        <button
          disabled={page === totalPages}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default HotelList;