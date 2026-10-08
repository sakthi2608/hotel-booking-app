
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HotelList from "./pages/HotelList";
import AddHotel from "./pages/AddHotel";
import HotelDetails from "./pages/HotelDetails";
import Hotels from "./pages/Hotels";
import About from "./pages/About";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HotelList />} />

        <Route path="/hotels" element={<Hotels />} />

        <Route path="/add-hotel" element={<AddHotel />} />

        <Route path="/hotel/:id" element={<HotelDetails />} />

        <Route path="/home" element={<HotelList />} />

        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
