import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchOrder = useCallback(async () => {
    setLoading(true); setError("");
    try { const response = await api.get(`/orders/${id}`); setOrder(response.data.order); }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to load this order."); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  return <main className="store-page"><Navbar /><section className="page-shell"><div className="page-title-row"><div><span className="eyebrow">ORDER DETAILS</span><h1>Your order<span className="heading-period">.</span></h1></div><Link to="/orders" className="secondary-button">← My orders</Link></div>
    {loading && <div className="state-panel"><span className="state-spinner" /><p>Loading order…</p></div>}
    {error && <div className="state-panel"><p className="error-copy">{error}</p><button className="primary-button" onClick={fetchOrder}>Try again</button></div>}
    {!loading && !error && order && <div className="order-detail-layout"><article className="panel-card"><div className="order-card-top"><div><span className="eyebrow">ORDER #{order._id}</span><p className="order-date">Placed {new Date(order.createdAt).toLocaleString("en-IN")}</p></div><span className={`order-status ${order.status === "PLACED" ? "status-good" : ""}`}>{order.status.replaceAll("_", " ")}</span></div><h2>Items in this order</h2>{order.items.map((item, index) => <div className="order-mini-item detail-item" key={`${item.product}-${index}`}><img src={item.image} alt="" /><span>{item.name}<small>Quantity: {item.quantity}</small></span><strong>{money(item.price * item.quantity)}</strong></div>)}<div className="summary-line summary-total"><span>Order total</span><strong>{money(order.totalAmount)}</strong></div><p className="summary-note">Payment status: <strong>{order.paymentStatus}</strong></p></article><aside className="panel-card shipping-card"><span className="eyebrow">DELIVERY TO</span><h2>{order.shippingAddress.fullName}</h2><p>{order.shippingAddress.addressLine1}<br />{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p><p>{order.shippingAddress.phone}</p></aside></div>}
  </section></main>;
}
