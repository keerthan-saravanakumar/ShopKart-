# ShopKart implementation and verification checklist

This checklist maps the project to the six instructor problem statements. The existing Customer/Product models, route names, React/Vite structure, Axios service, and cookie-based authentication have been retained and extended.

## Lab 01: Customer Authentication Service

- [x] `POST /customers/register`: required fields, unique email, six-character minimum password, bcrypt hashing, and no password in response.
- [x] `POST /customers/login`: credential check, JWT creation, HttpOnly cookie, and generic invalid-credentials response.
- [x] `GET /customers/me`: cookie JWT verification and protected customer profile.
- [x] `POST /customers/logout`: clears the authentication cookie.

## Lab 02: Login → Home Flow

- [x] Controlled Register and Login forms with validation/error messages.
- [x] Axios requests include credentials so the HttpOnly cookie is used.
- [x] Successful registration redirects to Login; successful login redirects to Home.
- [x] Home fetches `/customers/me` and redirects to Login if authentication fails.

## Lab 03: Product Catalog & Discovery

- [x] Existing Product schema and `POST /products`, `GET /products`, and `GET /products/:id` APIs retained.
- [x] Product listing is API-driven, with case-insensitive name search and category filtering.
- [x] Product details page, loading/error/empty states, and retry behaviour retained.

## Lab 04: Wishlist System

- [x] Customer schema stores Product ObjectId references in `wishlist` with an empty default.
- [x] Protected `POST /wishlist/:productId`, `GET /wishlist`, and `DELETE /wishlist/:productId` endpoints.
- [x] Invalid IDs, missing products, duplicates, missing wishlist items, and unauthenticated requests are handled with the required status classes.
- [x] Wishlist GET populates Product data; client identity always comes from the authenticated cookie, not a request `userId`.
- [x] Product cards provide save/loading/success/error feedback.
- [x] Wishlist page dynamically renders product cards, View Details, Remove, loading, empty, error, retry, and navigation states.

## Lab 05: Shopping Cart

- [x] Customer schema stores Product references plus quantity; default cart is empty and quantity minimum is 1.
- [x] Protected `POST /cart/:productId`, `GET /cart`, `PATCH /cart/:productId`, and `DELETE /cart/:productId` endpoints.
- [x] Adding the same product increments quantity; stock and quantity limits are validated; GET populates Product data.
- [x] React Context is the single shared frontend cart source, with loading/error state and add/update/remove/refresh actions.
- [x] Cart page has quantity controls, remove action, derived subtotal and total-unit count, and loading/empty/error states.
- [x] Navbar count updates from global cart state without a page refresh.

## Lab 06: Checkout & Orders

- [x] Order model stores customer reference, Product references, name/price/image snapshots, quantity, shipping address, server-calculated total, payment status, order status, and timestamps.
- [x] Checkout collects all six required shipping fields and validates non-empty values, a 10-digit Indian phone number, and a six-digit pincode before calling the API.
- [x] `POST /orders/create-payment-order` uses the authenticated user's cart, reloads latest products, checks stock, calculates total on the server, stores a pending order snapshot, and creates a Razorpay order in paise.
- [x] Razorpay key secret stays on the backend; the frontend receives only the public Key ID.
- [x] `POST /orders/verify-payment` verifies the HMAC-SHA256 signature against the Razorpay Order ID stored on the ShopKart order.
- [x] Order becomes `PAID` / `PLACED` and the cart clears only after successful signature verification. Invalid signatures and payment failures preserve the cart.
- [x] `GET /orders` and `GET /orders/:id` return only the authenticated customer's orders.
- [x] Order success, order history, order details, and their loading/error/empty states are implemented.

## Checks performed in this workspace

- [x] `node --check` passed for backend JavaScript files.
- [x] New wishlist/cart/order controllers, routes, and models load successfully in Node.
- [x] Babel parser accepted all 18 frontend JS/JSX source files.
- [x] PostCSS parsed the redesigned stylesheet.
- [ ] Live MongoDB API integration and a real Razorpay Test Mode payment were not run from this workspace because it does not have the user's local `.env`, live database access, or Razorpay Test Mode credentials.
- [ ] A Vite production build could not be run in this workspace because the uploaded `node_modules` were Windows-specific and the environment could not fetch the Linux optional native packages. The delivered ZIP excludes `node_modules`; run `npm install` in each folder on the target machine before testing/building.

## Required local setup before testing

1. Copy `backend/.env.example` to `backend/.env`.
2. Add the existing MongoDB connection string and JWT secret, plus Razorpay **Test Mode** Key ID and Key Secret.
3. Run `npm install` and `npm start` in `backend`.
4. Run `npm install` and `npm run dev` in `frontend`.
5. Test checkout using Razorpay Test Mode only.
