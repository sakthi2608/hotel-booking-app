import { useLocation, Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();

  return (
    <nav className={`navbar ${location.pathname !== "/home" ? "dark-navbar" : ""}`}>
      <h2>SaVi</h2>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/hotels">Hotels</Link>
        <Link to="/add-hotel">Add Hotel</Link>
        <Link to="/about">About Us</Link>
      </div>
    </nav>
  );
}

export default Navbar;