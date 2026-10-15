import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

export default function Home() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  useEffect(() => {
    let active = true;
    api.get("/customers/me").then((response) => { if (active) setCustomer(response.data); })
      .catch(() => { if (active) navigate("/login", { replace: true }); });
    return () => { active = false; };
  }, [navigate]);
  if (!customer) return <main className="loading-screen"><span className="state-spinner" /><p>Getting your account ready…</p></main>;
  return <main className="store-page"><Navbar /><section className="home-welcome"><span className="eyebrow">YOUR SHOPKART SPACE</span><h1>Hey, {customer.fullName.split(" ")[0]}<span className="heading-period">.</span></h1><p>Good to have you here. Your next favourite is just around the corner.</p><Link to="/products" className="primary-button">Explore the shop →</Link></section><section className="page-shell home-lower"><div className="section-heading-row"><div><span className="eyebrow">ACCOUNT DETAILS</span><h2>Your details<span className="heading-period">.</span></h2></div><Link to="/orders" className="secondary-button">My orders ↗</Link></div><article className="profile-card"><div><span>FULL NAME</span><strong>{customer.fullName}</strong></div><div><span>EMAIL ADDRESS</span><strong>{customer.email}</strong></div><div><span>PHONE NUMBER</span><strong>{customer.phone}</strong></div></article></section></main>;
}
