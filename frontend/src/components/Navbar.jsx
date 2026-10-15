import { Link, NavLink, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { cartCount, clearCartState } = useCart();

  async function handleLogout() {
    try {
      await api.post("/customers/logout");
    } catch {
      // Clear the local session view even if the cookie has already expired.
    } finally {
      clearCartState();
      navigate("/login");
    }
  }

  return (
    <>
      <div className="announcement-bar">GOOD FINDS. BETTER PRICES. EVERY DAY.</div>
      <header className="navbar">
        <Link to="/products" className="brand" aria-label="ShopKart home">SHOP<span>KART</span><i>.</i></Link>
        <nav className="navbar-links" aria-label="Main navigation">
          <NavLink to="/home">Home</NavLink>
          <NavLink to="/products">Shop all</NavLink>
          <NavLink to="/wishlist">Wishlist</NavLink>
          <NavLink to="/orders">My orders</NavLink>
        </nav>
        <div className="navbar-actions">
          <Link className="cart-nav-link" to="/cart" aria-label={`Cart, ${cartCount} items`}>
            <span className="cart-symbol">▢</span><span>Cart</span><b>{cartCount}</b>
          </Link>
          <button className="logout-button" onClick={handleLogout}>Log out</button>
        </div>
      </header>
    </>
  );
}
