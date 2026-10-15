# ShopKart

ShopKart is the existing MERN lab project extended through all six instructor problem statements: customer authentication, login-to-home flow, product catalogue, wishlist, shopping cart, and checkout/orders.

## Requirements

- Node.js 18+ (Node 20+ recommended)
- MongoDB Atlas or a local MongoDB instance
- Razorpay **Test Mode** API keys for the Lab 06 payment flow

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and fill in your own values:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

Keep `.env` private. Never commit it or expose `RAZORPAY_KEY_SECRET` to the frontend. Use Razorpay Test Mode only for this lab.

Start the API:

```bash
npm start
```

The API connects to MongoDB before listening on port 5000. `GET /health` reports when the server is running.

### 2. Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

If the backend runs on a different URL, set `VITE_API_URL` in `frontend/.env` (for example, `VITE_API_URL=http://localhost:5000`).

## Lab features

1. **Authentication:** register, login, HttpOnly JWT cookie, protected profile and logout.
2. **Login → Home:** React Router pages and Axios cookie requests.
3. **Product catalogue:** create/list/detail APIs, case-insensitive name search and category filtering.
4. **Wishlist:** persistent Product ObjectId references, protected add/list/remove APIs, duplicate prevention, populated data and loading/empty/error states.
5. **Cart:** persistent Product references and quantity, protected add/list/update/remove APIs, stock validation, React Context state, live navbar count and derived subtotal.
6. **Checkout & orders:** shipping validation, server-side latest-price/stock checks, order snapshots, Razorpay Test Mode order creation, HMAC signature verification, cart clearing only after verified payment, order confirmation and protected order history/details.

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/customers/register` | Register a customer |
| POST | `/customers/login` | Login and set HttpOnly cookie |
| GET | `/customers/me` | Current customer profile |
| POST | `/customers/logout` | Clear login cookie |
| POST | `/products` | Create product (Lab 03 API) |
| GET | `/products` | List/search/filter products |
| GET | `/products/:id` | Product details |
| POST | `/wishlist/:productId` | Add to wishlist |
| GET | `/wishlist` | Current customer's wishlist |
| DELETE | `/wishlist/:productId` | Remove from wishlist |
| POST | `/cart/:productId` | Add/increment cart item |
| GET | `/cart` | Current customer's cart |
| PATCH | `/cart/:productId` | Set item quantity |
| DELETE | `/cart/:productId` | Remove cart item |
| POST | `/orders/create-payment-order` | Validate cart and create Razorpay order |
| POST | `/orders/verify-payment` | Verify payment signature and place order |
| GET | `/orders` | Current customer's order history |
| GET | `/orders/:id` | Current customer's order details |

## Before submitting

- Create a product using `POST /products` if your database has no products yet.
- Log in before using wishlist, cart, checkout, and order pages.
- Complete the checkout only with Razorpay Test Mode credentials.
- Test duplicate wishlist requests, cart stock limits, empty-cart checkout, invalid payment signature, and order ownership.
