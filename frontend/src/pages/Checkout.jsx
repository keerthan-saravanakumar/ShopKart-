import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { useCart } from "../context/CartContext";

const initialAddress = { fullName: "", phone: "", addressLine1: "", city: "", state: "", pincode: "" };
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector('script[data-razorpay="checkout"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.dataset.razorpay = "checkout";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartLoading, cartError, subtotal, cartCount, clearCartState, refreshCart } = useCart();
  const [address, setAddress] = useState(initialAddress);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  function validate() {
    const next = {};
    Object.entries(address).forEach(([key, value]) => { if (!value.trim()) next[key] = "This field is required."; });
    if (address.phone.trim() && !/^[6-9]\d{9}$/.test(address.phone.trim())) next.phone = "Enter a valid 10-digit phone number.";
    if (address.pincode.trim() && !/^\d{6}$/.test(address.pincode.trim())) next.pincode = "Pincode must contain 6 digits.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleChange(event) {
    setAddress((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;
    if (!cartItems.length) { setFormError("Your cart is empty."); return; }
    setPlacingOrder(true);
    try {
      const response = await api.post("/orders/create-payment-order", { shippingAddress: address });
      const paymentData = response.data;
      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) throw new Error("Could not load Razorpay Checkout. Check your connection and try again.");

      const checkout = new window.Razorpay({
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: "ShopKart",
        description: "ShopKart order payment",
        order_id: paymentData.razorpayOrderId,
        prefill: { name: address.fullName, contact: address.phone },
        theme: { color: "#c8f169" },
        handler: async (paymentResponse) => {
          setPlacingOrder(true);
          try {
            await api.post("/orders/verify-payment", {
              shopKartOrderId: paymentData.shopKartOrderId,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature
            });
            clearCartState();
            navigate(`/order-success/${paymentData.shopKartOrderId}`);
          } catch (verificationError) {
            setFormError(verificationError.response?.data?.message || "Payment could not be verified. Your cart has been kept. Please contact support before retrying.");
            await refreshCart().catch(() => {});
          } finally { setPlacingOrder(false); }
        },
        modal: { ondismiss: () => setPlacingOrder(false) }
      });
      checkout.on("payment.failed", (failure) => {
        setFormError(failure.error?.description || "Payment failed. Your cart has not been cleared. Please try again.");
        setPlacingOrder(false);
      });
      checkout.open();
    } catch (error) {
      setFormError(error.response?.data?.message || error.message || "Unable to start checkout. Please try again.");
      setPlacingOrder(false);
    }
  }

  return <main className="store-page"><Navbar /><section className="page-shell checkout-shell">
    <div className="page-title-row"><div><span className="eyebrow">ALMOST YOURS</span><h1>Checkout<span className="heading-period">.</span></h1><p className="muted">A few details, then you're all set.</p></div><Link to="/cart" className="secondary-button">← Back to cart</Link></div>
    {cartLoading && <div className="state-panel"><span className="state-spinner" /><p>Loading your cart…</p></div>}
    {!cartLoading && cartError && <div className="state-panel"><p className="error-copy">{cartError}</p><button className="primary-button" onClick={() => refreshCart().catch(() => {})}>Try again</button></div>}
    {!cartLoading && !cartError && cartItems.length === 0 && <div className="empty-state"><h2>Your cart is empty.</h2><p>Add something you love before checking out.</p><Link to="/products" className="primary-button">Browse products</Link></div>}
    {!cartLoading && !cartError && cartItems.length > 0 && <div className="checkout-layout"><form className="checkout-form panel-card" onSubmit={handleSubmit} noValidate><span className="eyebrow">DELIVERY DETAILS</span><h2>Where should we send it?</h2><div className="form-grid"><label className="field-full">Full name<input name="fullName" autoComplete="name" value={address.fullName} onChange={handleChange} />{errors.fullName && <small className="field-error">{errors.fullName}</small>}</label><label>Phone number<input name="phone" inputMode="numeric" autoComplete="tel" maxLength="10" value={address.phone} onChange={handleChange} />{errors.phone && <small className="field-error">{errors.phone}</small>}</label><label className="field-full">Address line<input name="addressLine1" autoComplete="street-address" value={address.addressLine1} onChange={handleChange} />{errors.addressLine1 && <small className="field-error">{errors.addressLine1}</small>}</label><label>City<input name="city" autoComplete="address-level2" value={address.city} onChange={handleChange} />{errors.city && <small className="field-error">{errors.city}</small>}</label><label>State<input name="state" autoComplete="address-level1" value={address.state} onChange={handleChange} />{errors.state && <small className="field-error">{errors.state}</small>}</label><label>Pincode<input name="pincode" inputMode="numeric" autoComplete="postal-code" maxLength="6" value={address.pincode} onChange={handleChange} />{errors.pincode && <small className="field-error">{errors.pincode}</small>}</label></div>{formError && <p className="message error">{formError}</p>}<button className="primary-button full-width" type="submit" disabled={placingOrder}>{placingOrder ? "Preparing secure payment…" : `Place order · ${money(subtotal)}`}</button><p className="secure-note">Payment is handled securely through Razorpay Test Mode.</p></form><aside className="order-summary checkout-summary"><span className="eyebrow">YOUR ORDER</span><h2>Order summary</h2><div className="checkout-lines">{cartItems.filter((item) => item.product).map(({ product, quantity }) => <div className="checkout-line" key={product._id}><img src={product.image} alt="" /><div><strong>{product.name}</strong><span>Qty {quantity}</span></div><b>{money(product.price * quantity)}</b></div>)}</div><div className="summary-line"><span>Total items</span><span>{cartCount}</span></div><div className="summary-line summary-total"><span>Total</span><strong>{money(subtotal)}</strong></div><p className="summary-note">Final price and stock are checked again before payment.</p></aside></div>}
  </section></main>;
}
