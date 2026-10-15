import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchOrders = useCallback(async () => {
    setLoading(true); setError("");
    try { const response = await api.get("/orders"); setOrders(response.data.orders || []); }
    catch (requestError) { setError(requestError.response?.status === 401 ? "Please sign in to view your orders." : "Unable to load your orders."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return <main className="store-page"><Navbar /><section className="page-shell"><div className="page-title-row"><div><span className="eyebrow">YOUR SHOPKART HISTORY</span><h1>My orders<span className="heading-period">.</span></h1><p className="muted">Everything you've checked out, all in one place.</p></div><Link to="/products" className="secondary-button">Shop again ↗</Link></div>
    {loading && <div className="state-panel"><span className="state-spinner" /><p>Loading your orders…</p></div>}
    {error && <div className="state-panel"><p className="error-copy">{error}</p><button className="primary-button" onClick={fetchOrders}>Try again</button></div>}
    {!loading && !error && orders.length === 0 && <div className="empty-state"><span className="empty-icon">↗</span><h2>Your next favourite is out there.</h2><p>You haven't placed any orders yet.</p><Link to="/products" className="primary-button">Start shopping</Link></div>}
    {!loading && !error && orders.length > 0 && <div className="orders-list">{orders.map((order) => <article className="order-card" key={order._id}><div className="order-card-top"><div><span className="eyebrow">ORDER #{order._id.slice(-8).toUpperCase()}</span><p className="order-date">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></div><span className={`order-status ${order.status === "PLACED" ? "status-good" : ""}`}>{order.status.replaceAll("_", " ")}</span></div><div className="order-card-items">{order.items.map((item, index) => <div className="order-mini-item" key={`${item.product}-${index}`}><img src={item.image} alt="" /><span>{item.name} <b>× {item.quantity}</b></span><strong>{money(item.price * item.quantity)}</strong></div>)}</div><div className="order-card-bottom"><div><span>Total</span><strong>{money(order.totalAmount)}</strong></div><Link to={`/orders/${order._id}`} className="secondary-button">View order details →</Link></div></article>)}</div>}
  </section></main>;
}
