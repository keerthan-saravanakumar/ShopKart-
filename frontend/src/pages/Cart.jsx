import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function Cart() {
  const { cartItems, cartLoading, cartError, mutationError, mutationLoading, cartCount, subtotal, refreshCart, updateQuantity, removeFromCart } = useCart();
  async function changeQuantity(productId, quantity) {
    try { await updateQuantity(productId, quantity); } catch { /* message is displayed from context */ }
  }
  async function removeItem(productId) {
    try { await removeFromCart(productId); } catch { /* message is displayed from context */ }
  }

  return <main className="store-page"><Navbar /><section className="page-shell">
    <div className="page-title-row"><div><span className="eyebrow">YOUR PICKS, TOGETHER</span><h1>My cart<span className="heading-period">.</span></h1><p className="muted">{cartCount} {cartCount === 1 ? "item" : "items"} ready when you are.</p></div><Link to="/products" className="secondary-button">Keep shopping ↗</Link></div>
    {cartLoading && <div className="state-panel"><span className="state-spinner" /><p>Loading your cart…</p></div>}
    {!cartLoading && cartError && <div className="state-panel"><p className="error-copy">{cartError}</p><button className="primary-button" onClick={() => refreshCart().catch(() => {})}>Try again</button></div>}
    {!cartLoading && !cartError && cartItems.length === 0 && <div className="empty-state"><span className="empty-icon">▢</span><h2>Your cart is taking a little break.</h2><p>Looks like you haven't added anything yet.</p><Link to="/products" className="primary-button">Browse products</Link></div>}
    {!cartLoading && !cartError && cartItems.length > 0 && <>{mutationError && <p className="message error">{mutationError}</p>}<div className="cart-layout"><div className="cart-items-list">{cartItems.map(({ product, quantity }) => product && <article className="cart-item" key={product._id}><Link to={`/products/${product._id}`} className="cart-item-image"><img src={product.image} alt={product.name} /></Link><div className="cart-item-info"><span className="product-category-badge">{product.category}</span><Link to={`/products/${product._id}`} className="cart-item-name">{product.name}</Link><p className="cart-unit-price">{money(product.price)} each</p><div className="quantity-control"><button aria-label={`Decrease ${product.name} quantity`} onClick={() => changeQuantity(product._id, quantity - 1)} disabled={mutationLoading || quantity <= 1}>−</button><span>{quantity}</span><button aria-label={`Increase ${product.name} quantity`} onClick={() => changeQuantity(product._id, quantity + 1)} disabled={mutationLoading || quantity >= product.stock}>+</button></div><button className="text-danger-button" onClick={() => removeItem(product._id)} disabled={mutationLoading}>Remove item</button></div><div className="cart-item-total">{money(product.price * quantity)}</div></article>)}</div><aside className="order-summary"><span className="eyebrow">THE NUMBERS</span><h2>Order summary</h2><div className="summary-line"><span>Items</span><span>{cartCount}</span></div><div className="summary-line"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div className="summary-line summary-total"><span>Total</span><strong>{money(subtotal)}</strong></div><p className="summary-note">Shipping details are collected at checkout.</p><Link to="/checkout" className="primary-button full-width">Proceed to checkout <span>→</span></Link></aside></div></>}
  </section></main>;
}
