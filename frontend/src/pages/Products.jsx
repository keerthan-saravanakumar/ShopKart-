import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import api from "../services/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      const response = await api.get("/products", { params });
      setProducts(response.data.products || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Something went wrong while loading products.");
    } finally { setLoading(false); }
  }, [search, category]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <main className="store-page">
      <Navbar />
      <section className="store-hero">
        <div className="store-hero-copy">
          <span className="eyebrow">THE EVERYDAY EDIT</span>
          <h1>Good stuff.<br /><em>Great finds.</em></h1>
          <p>Little upgrades, big favourites. Find the things worth making room for.</p>
          <a href="#catalog" className="hero-cta">Explore the collection <span>↘</span></a>
        </div>
        <div className="hero-art" aria-label="ShopKart collection">
          <div className="hero-art-top">NEW SEASON / NO. 01</div>
          <div className="hero-art-sticker">FIND<br />YOUR<br /><b>FAVOURITE.</b></div>
          <div className="hero-art-bottom"><span>CURATED FOR YOU</span><span>EST. 2026</span></div>
        </div>
      </section>

      <section id="catalog" className="products-content">
        <div className="section-heading-row">
          <div><span className="eyebrow">THE SHOPKART EDIT</span><h2>Shop all products<span className="heading-period">.</span></h2></div>
          <p className="section-note">Good things, picked for everyday living.</p>
        </div>
        <SearchBar search={search} onSearchChange={setSearch} category={category} onCategoryChange={setCategory} />
        {!loading && !error && <p className="result-count">{products.length} {products.length === 1 ? "product" : "products"} to explore</p>}
        {loading && <div className="state-panel"><span className="state-spinner" /> <p>Finding your next favourite…</p></div>}
        {error && <div className="state-panel"><p className="error-copy">{error}</p><button className="secondary-button" onClick={fetchProducts}>Try again</button></div>}
        {!loading && !error && products.length === 0 && <div className="state-panel"><h3>No matches this time.</h3><p>Try another search or choose a different category.</p></div>}
        {!loading && !error && products.length > 0 && <div className="products-grid">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div>}
      </section>
      <footer className="site-footer"><Link to="/products" className="brand">SHOP<span>KART</span><i>.</i></Link><p>Thoughtful finds for everyday life.</p><span>© 2026 SHOPKART</span></footer>
    </main>
  );
}
