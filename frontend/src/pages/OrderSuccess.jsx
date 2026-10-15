import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api.get(`/orders/${id}`).then((response) => {
      if (!active) return;
      if (response.data.order?.paymentStatus !== "PAID") setError("This order has not been confirmed as paid.");
      else setOrder(response.data.order);
    })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Unable to load your order confirmation."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  return <main className="store-page"><Navbar /><section className="page-shell"><div className="success-panel"><div className="success-mark">✓</div><span className="eyebrow">THAT'S A WRAP</span><h1>{loading ? "Confirming your order…" : error ? "Order confirmation unavailable" : "Order placed successfully."}</h1>{error && <p className="error-copy">{error}</p>}{order && <><p>Your payment is verified and your order is safely saved.</p><div className="success-order-info"><span>Order ID</span><strong>{order._id}</strong><span>Total paid</span><strong>{money(order.totalAmount)}</strong><span>Status</span><strong>{order.status}</strong></div></>}<div className="success-actions"><Link to="/orders" className="primary-button">View my orders</Link><Link to="/products" className="secondary-button">Continue shopping</Link></div></div></section></main>;
}
