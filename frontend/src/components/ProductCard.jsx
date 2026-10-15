import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  async function handleWishlist() {
    setSavingWishlist(true); setMessage("");
    try {
      await api.post(`/wishlist/${product._id}`);
      setWishlistAdded(true);
      setMessage("Saved to your wishlist");
      setMessageType("success");
    } catch (error) {
      const status = error.response?.status;
      if (status === 409) {
        setWishlistAdded(true);
        setMessage("Already in your wishlist");
        setMessageType("success");
      } else {
        setMessage(error.response?.data?.message || "Could not save this product. Please sign in and try again.");
        setMessageType("error");
      }
    } finally { setSavingWishlist(false); }
  }

  async function handleAddToCart() {
    setAddingCart(true); setMessage("");
    try {
      await addToCart(product._id);
      setMessage("Added to cart"); setMessageType("success");
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not add this item. Please sign in and try again.");
      setMessageType("error");
    } finally { setAddingCart(false); }
  }

  return (
    <article className="product-card">
      <div className="product-card-image">
        <span className="image-kicker">SHOPKART SELECT</span>
        <button className={`wishlist-heart ${wishlistAdded ? "is-saved" : ""}`} onClick={handleWishlist} disabled={savingWishlist || wishlistAdded} aria-label={wishlistAdded ? "Already in wishlist" : "Add to wishlist"}>
          {savingWishlist ? "…" : wishlistAdded ? "♥" : "♡"}
        </button>
        <Link to={`/products/${product._id}`} className="image-link" aria-label={`View ${product.name}`}>
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>
      </div>
      <div className="product-card-body">
        <span className="product-category-badge">{product.category}</span>
        <Link to={`/products/${product._id}`} className="product-card-name">{product.name}</Link>
        <div className="product-price-row">
          <p className="product-card-price">₹{Number(product.price).toLocaleString("en-IN")}</p>
          <span className={product.stock > 0 ? "stock in-stock" : "stock out-of-stock"}>{product.stock > 0 ? "IN STOCK" : "SOLD OUT"}</span>
        </div>
        <button className="wishlist-text-action" onClick={handleWishlist} disabled={savingWishlist || wishlistAdded}>{savingWishlist ? "Saving…" : wishlistAdded ? "♥ Added to Wishlist" : "♡ Add to Wishlist"}</button>
        <div className="product-card-actions">
          <Link to={`/products/${product._id}`} className="secondary-button">View details</Link>
          <button className="primary-button" onClick={handleAddToCart} disabled={addingCart || product.stock < 1}>
            {addingCart ? "Adding…" : "Add to cart"}
          </button>
        </div>
        {message && <p className={`inline-message ${messageType}`}>{message}</p>}
      </div>
    </article>
  );
}
