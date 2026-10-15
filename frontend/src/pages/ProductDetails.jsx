import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    let active = true;
    async function fetchProduct() {
      setLoading(true); setError("");
      try { const response = await api.get(`/products/${id}`); if (active) setProduct(response.data.product); }
      catch (requestError) { if (active) setError(requestError.response?.data?.message || "Something went wrong while loading the product."); }
      finally { if (active) setLoading(false); }
    }
    fetchProduct();
    return () => { active = false; };
  }, [id]);

  async function handleAddToCart() {
    setAdding(true); setMessage("");
    try { await addToCart(product._id); setMessage("Added to your cart."); setMessageType("success"); }
    catch (requestError) { setMessage(requestError.response?.data?.message || "Could not add this product. Please sign in and try again."); setMessageType("error"); }
    finally { setAdding(false); }
  }

  return <main className="store-page"><Navbar /><section className="page-shell">
    <Link to="/products" className="back-link">← Back to the shop</Link>
    {loading && <div className="state-panel"><span className="state-spinner" /><p>Loading product…</p></div>}
    {error && <div className="state-panel"><p className="error-copy">{error}</p><Link to="/products" className="secondary-button">Back to products</Link></div>}
    {!loading && !error && !product && <div className="state-panel"><p>Product not found.</p></div>}
    {!loading && !error && product && <div className="product-details"><div className="product-details-image"><img src={product.image} alt={product.name} /></div><div className="product-details-info"><span className="eyebrow">THE SHOPKART EDIT</span><span className="product-category-badge">{product.category}</span><h1>{product.name}<span className="heading-period">.</span></h1><p className="product-details-price">₹{Number(product.price).toLocaleString("en-IN")}</p><p className="product-details-description">{product.description}</p><p className={product.stock > 0 ? "stock in-stock" : "stock out-of-stock"}>{product.stock > 0 ? `${product.stock} units available` : "Out of stock"}</p><div className="detail-actions"><button className="primary-button" onClick={handleAddToCart} disabled={adding || product.stock < 1}>{adding ? "Adding…" : "Add to cart"}</button><Link to="/wishlist" className="secondary-button">View wishlist</Link></div>{message && <p className={`message ${messageType === "error" ? "error" : "success-message"}`}>{message}</p>}</div></div>}
  </section></main>;
}
