import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

export default function Login() {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  function handleChange(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function handleSubmit(event) {
    event.preventDefault(); setError("");
    if (!form.email.trim() || !form.password) { setError("Enter your email and password."); return; }
    setSubmitting(true);
    try { await api.post("/customers/login", form); await refreshCart().catch(() => {}); navigate("/home"); }
    catch { setError("Invalid Credentials"); }
    finally { setSubmitting(false); }
  }
  return <main className="auth-layout"><section className="auth-copy"><Link to="/products" className="brand auth-brand">SHOP<span>KART</span><i>.</i></Link><span className="eyebrow">GOOD TO SEE YOU AGAIN</span><h1>Your next<br /><em>great find</em><br />is waiting.</h1><p>Sign in to pick up where you left off, save favourites and keep your cart close.</p><div className="auth-side-note">THE EVERYDAY EDIT <span>✳</span> MADE FOR YOU</div></section><section className="auth-card-wrap"><div className="auth-card"><span className="eyebrow">YOUR ACCOUNT</span><h2>Welcome back.</h2><p className="muted">Use your ShopKart details to sign in.</p><form onSubmit={handleSubmit}><label>Email address<input name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required /></label><label>Password<input name="password" type="password" autoComplete="current-password" value={form.password} onChange={handleChange} required /></label>{error && <p className="message error">{error}</p>}<button className="primary-button full-width" disabled={submitting}>{submitting ? "Signing in…" : "Sign in →"}</button></form><p className="switch-copy">New around here? <Link to="/register">Create an account</Link></p></div></section></main>;
}
