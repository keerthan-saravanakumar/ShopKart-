import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState("");
  const [actionError, setActionError] = useState("");

  const fetchWishlist = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await api.get("/wishlist");
      setWishlist(response.data.wishlist || []);
    } catch (requestError) {
      setError(requestError.response?.status === 401 ? "Please sign in to view your wishlist." : "Unable to load wishlist.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  async function handleRemove(productId) {
    setRemovingId(productId); setActionError("");
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlist((items) => items.filter((item) => item._id !== productId));
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || "Unable to remove this product. Please try again.");
    } finally { setRemovingId(""); }
  }

  return <main className="store-page"><Navbar /><section className="page-shell">
    <div className="page-title-row"><div><span className="eyebrow">SAVED FOR LATER</span><h1>My wishlist<span className="heading-period">.</span></h1><p className="muted">The ones you want to come back to.</p></div><Link to="/products" className="secondary-button">Continue shopping ↗</Link></div>
    {loading && <div className="state-panel"><span className="state-spinner" /><p>Loading your wishlist…</p></div>}
    {error && <div className="state-panel"><p className="error-copy">{error}</p><button className="primary-button" onClick={fetchWishlist}>Try again</button></div>}
    {actionError && <p className="message error">{actionError}</p>}
    {!loading && !error && wishlist.length === 0 && <div className="empty-state"><span className="empty-icon">♡</span><h2>Your wishlist is empty.</h2><p>Save products you love and find them here later.</p><Link to="/products" className="primary-button">Browse products</Link></div>}
    {!loading && !error && wishlist.length > 0 && <><p className="result-count">{wishlist.length} saved {wishlist.length === 1 ? "product" : "products"}</p><div className="products-grid">{wishlist.map((product) => <article className="product-card" key={product._id}><div className="product-card-image"><Link to={`/products/${product._id}`} className="image-link"><img src={product.image} alt={product.name} loading="lazy" /></Link><span className="saved-ribbon">SAVED ♥</span></div><div className="product-card-body"><span className="product-category-badge">{product.category}</span><Link to={`/products/${product._id}`} className="product-card-name">{product.name}</Link><div className="product-price-row"><p className="product-card-price">₹{Number(product.price).toLocaleString("en-IN")}</p><span className={product.stock > 0 ? "stock in-stock" : "stock out-of-stock"}>{product.stock > 0 ? `${product.stock} left` : "SOLD OUT"}</span></div><div className="product-card-actions"><Link to={`/products/${product._id}`} className="secondary-button">View details</Link><button className="outline-danger-button" onClick={() => handleRemove(product._id)} disabled={removingId === product._id}>{removingId === product._id ? "Removing…" : "Remove ♥"}</button></div></div></article>)}</div></>}
  </section></main>;
}
