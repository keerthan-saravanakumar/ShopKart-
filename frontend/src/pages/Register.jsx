import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  function handleChange(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function handleSubmit(event) {
    event.preventDefault(); setError("");
    if ([form.fullName, form.email, form.password, form.phone].some((value) => !value.trim())) { setError("All fields are required."); return; }
    if (form.password.length < 6) { setError("Password must contain at least 6 characters."); return; }
    setSubmitting(true);
    try { await api.post("/customers/register", form); navigate("/login", { state: { registered: true } }); }
    catch (requestError) { setError(requestError.response?.data?.message || "Registration failed. Please try again."); }
    finally { setSubmitting(false); }
  }
  return <main className="auth-layout"><section className="auth-copy"><Link to="/products" className="brand auth-brand">SHOP<span>KART</span><i>.</i></Link><span className="eyebrow">MAKE ROOM FOR GOOD THINGS</span><h1>Good taste.<br /><em>Good finds.</em><br />Your kind of shop.</h1><p>Create an account to save the things you love and make every next visit feel familiar.</p><div className="auth-side-note">YOUR PICKS, YOUR PACE <span>✳</span> SHOPKART</div></section><section className="auth-card-wrap"><div className="auth-card"><span className="eyebrow">JOIN THE CLUB</span><h2>Create your account.</h2><p className="muted">Just the basics. Then you're in.</p><form onSubmit={handleSubmit}><label>Full name<input name="fullName" autoComplete="name" value={form.fullName} onChange={handleChange} required /></label><label>Email address<input name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required /></label><label>Phone number<input name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange} required /></label><label>Password<input name="password" type="password" autoComplete="new-password" minLength="6" value={form.password} onChange={handleChange} required /></label>{error && <p className="message error">{error}</p>}<button className="primary-button full-width" disabled={submitting}>{submitting ? "Creating account…" : "Create account →"}</button></form><p className="switch-copy">Already have an account? <Link to="/login">Sign in</Link></p></div></section></main>;
}
