# ShopKart 🛍️

### A Full-Stack MERN E-Commerce Application

ShopKart is a full-stack e-commerce web application built using the MERN stack. It provides a complete shopping experience with customer authentication, product discovery, wishlist management, shopping cart functionality, and a checkout system integrated with Razorpay Test Mode.

The project extends the original MERN lab implementation across six problem statements, covering both frontend development and backend API integration.

---

## 📌 Table of Contents

* [Overview](#-overview)
* [Features](#-features)
* [Technology Stack](#-technology-stack)
* [Project Structure](#-project-structure)
* [Getting Started](#-getting-started)
* [Environment Configuration](#-environment-configuration)
* [Running the Application](#-running-the-application)
* [API Endpoints](#-api-endpoints)
* [Payment Integration](#-payment-integration)
* [Security Considerations](#-security-considerations)
* [Future Improvements](#-future-improvements)

---

## 🚀 Overview

ShopKart demonstrates how a modern e-commerce application can be built using React on the frontend and Node.js with Express on the backend.

The application follows a client-server architecture. The frontend communicates with REST APIs, while the backend manages authentication, business logic, database operations, cart and wishlist persistence, and order processing.

The interface uses a clean, modern shopping design with responsive layouts and reusable React components.

### Key Highlights

* Full-stack application with separate frontend and backend.
* RESTful API architecture.
* Persistent data storage using MongoDB and Mongoose.
* Cookie-based JWT authentication.
* Persistent wishlist and shopping cart.
* Server-side cart validation and order processing.
* Razorpay Test Mode payment integration.

---

## ✨ Features

### 1. Customer Authentication

* Customer registration and login.
* Password hashing using bcrypt.
* JWT-based authentication using HttpOnly cookies.
* Protected customer profile endpoint.
* Logout functionality.

### 2. Product Catalogue

* Browse available products.
* View individual product details.
* Search products by name.
* Filter products by category.
* Reusable product cards and navigation components.

### 3. Wishlist Management

* Add products to a wishlist.
* View saved products.
* Remove products from the wishlist.
* Prevent duplicate wishlist entries.
* Persist wishlist data in MongoDB.

### 4. Shopping Cart

* Add products to the cart.
* Increase or decrease product quantities.
* Remove products from the cart.
* Calculate the cart subtotal.
* Display the current cart item count in the navigation bar.
* Validate product availability and stock limits.
* Persist cart data for authenticated customers.

### 5. Checkout and Orders

* Collect and validate shipping information.
* Validate cart contents, product prices, and stock on the server.
* Create payment orders through Razorpay Test Mode.
* Verify payment signatures on the backend.
* Generate order records after successful payment verification.
* Clear the cart after verified payment.
* View order history and individual order details.

### 6. User Interface

* Modern e-commerce storefront.
* Responsive layouts.
* Reusable React components.
* Dedicated product, wishlist, cart, checkout, and order pages.
* Loading, empty, and error states where implemented.

---

## 🧰 Technology Stack

| Category          | Technologies                    |
| ----------------- | ------------------------------- |
| Frontend          | React, Vite, JavaScript         |
| Routing           | React Router                    |
| API Communication | Axios                           |
| Styling           | CSS3                            |
| Backend           | Node.js, Express.js             |
| Database          | MongoDB                         |
| ODM               | Mongoose                        |
| Authentication    | JSON Web Tokens, bcrypt         |
| Cookies           | cookie-parser, HttpOnly cookies |
| Payments          | Razorpay Test Mode              |
| Version Control   | Git, GitHub                     |

---

## 📁 Project Structure

```text
ShopKart/
│
├── backend/
│   ├── controllers/
│   │   ├── customer.controller.js
│   │   ├── product.controller.js
│   │   ├── wishlist.controller.js
│   │   ├── cart.controller.js
│   │   └── order.controller.js
│   │
│   ├── middlewares/
│   │   └── auth.middleware.js
│   │
│   ├── models/
│   │   ├── customer.model.js
│   │   ├── product.model.js
│   │   └── order.model.js
│   │
│   ├── routes/
│   │   ├── customer.routes.js
│   │   ├── product.routes.js
│   │   ├── wishlist.routes.js
│   │   ├── cart.routes.js
│   │   └── order.routes.js
│   │
│   ├── utils/
│   │   └── generateToken.js
│   │
│   ├── .env.example
│   ├── index.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## ⚙️ Getting Started

Follow these steps to run ShopKart locally.

### Prerequisites

Ensure the following are installed or available:

* Node.js 20 or a compatible newer version.
* npm.
* MongoDB Atlas or a local MongoDB instance.
* A Razorpay account with Test Mode API keys for testing the payment integration.
* Git, if you want to clone the repository.


### 1. Clone the Repository

Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/keerthan-saravanakumar/ShopKart-.git
cd ShopKart-
```

The project contains separate frontend and backend applications. Each application has its own dependencies and environment configuration.


Replace `<YOUR_GITHUB_REPOSITORY_URL>` with the actual GitHub repository URL.

### 2. Configure the Backend

Open a terminal in the project root and navigate to the backend directory:

```bash
cd backend
npm install
```

Create your local environment configuration file from the provided example.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

Open `backend/.env` and configure your MongoDB connection string, JWT secret, and Razorpay Test Mode credentials.

Keep this file private. Never commit your actual `.env` file to GitHub.


### 3. Configure the Frontend

Open a second terminal from the project root and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Create the frontend environment file:

```powershell
Copy-Item .env.example .env
```

Ensure the API URL points to your local backend.

---

## 🔐 Environment Configuration

### Backend Environment Variables

Configure the following variables in `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

**Important:** Replace every placeholder with your own configuration.

* `PORT`: Port used by the Express server.
* `MONGO_URI`: MongoDB connection string.
* `JWT_SECRET`: Secret used for signing authentication tokens.
* `FRONTEND_URL`: Frontend origin allowed by the backend's CORS configuration.
* `RAZORPAY_KEY_ID`: Razorpay Test Mode Key ID.
* `RAZORPAY_KEY_SECRET`: Razorpay Test Mode Key Secret.

### Frontend Environment Variables

Configure `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

This variable tells the frontend where to send API requests.

Restart the Vite development server after changing frontend environment variables.

---

## ▶️ Running the Application

Run the frontend and backend in separate terminals.

### Start the Backend

From the project root:

```bash
cd backend
npm start
```

The backend connects to MongoDB before starting the Express server.

By default, the API runs at:

`http://localhost:5000`

You can check whether the server is running by opening:

`http://localhost:5000/health`

A successful response indicates that the ShopKart API is running.

### Start the Frontend

In a second terminal:

```bash
cd frontend
npm run dev
```

Vite normally serves the application at:

`http://localhost:5173`

Open that address in your browser.

---

## 🔌 API Endpoints

All endpoints are relative to the backend base URL:

`http://localhost:5000`

### Customer Authentication

| Method | Endpoint              | Description                                   |
| ------ | --------------------- | --------------------------------------------- |
| POST   | `/customers/register` | Register a customer                           |
| POST   | `/customers/login`    | Authenticate a customer                       |
| GET    | `/customers/me`       | Retrieve the authenticated customer's profile |
| POST   | `/customers/logout`   | Log out the customer                          |

### Products

| Method | Endpoint        | Description                                            |
| ------ | --------------- | ------------------------------------------------------ |
| POST   | `/products`     | Create a product                                       |
| GET    | `/products`     | Retrieve products, with supported search and filtering |
| GET    | `/products/:id` | Retrieve product details                               |

### Wishlist

| Method | Endpoint               | Description                                    |
| ------ | ---------------------- | ---------------------------------------------- |
| POST   | `/wishlist/:productId` | Add a product to the wishlist                  |
| GET    | `/wishlist`            | Retrieve the authenticated customer's wishlist |
| DELETE | `/wishlist/:productId` | Remove a product from the wishlist             |

### Shopping Cart

| Method | Endpoint           | Description                                |
| ------ | ------------------ | ------------------------------------------ |
| POST   | `/cart/:productId` | Add a product to the cart                  |
| GET    | `/cart`            | Retrieve the authenticated customer's cart |
| PATCH  | `/cart/:productId` | Update a product's quantity                |
| DELETE | `/cart/:productId` | Remove a product from the cart             |

### Checkout and Orders

| Method | Endpoint                       | Description                                           |
| ------ | ------------------------------ | ----------------------------------------------------- |
| POST   | `/orders/create-payment-order` | Validate the cart and create a Razorpay payment order |
| POST   | `/orders/verify-payment`       | Verify payment details and place the order            |
| GET    | `/orders`                      | Retrieve the authenticated customer's order history   |
| GET    | `/orders/:id`                  | Retrieve a specific order belonging to the customer   |

**Note:** Endpoints that operate on a customer's account, wishlist, cart, or orders require the appropriate authentication.

---

## 💳 Payment Integration

ShopKart includes Razorpay Test Mode integration for the checkout workflow.

The intended payment flow is:

1. The customer proceeds to checkout.
2. The backend validates the cart and creates a Razorpay order.
3. Razorpay Checkout handles the test payment.
4. The frontend sends the payment response to the backend.
5. The backend verifies the payment signature.
6. The order is created after successful verification.
7. The customer can view the order confirmation and order history.

Use Razorpay's supported test payment methods and test credentials when validating this workflow.

**This project is intended for testing, not processing real customer payments.** Successful end-to-end payment verification should be tested separately before treating the payment workflow as complete.

---

## 🛡️ Security Considerations

* Passwords are hashed before storage.
* Authentication uses JWTs stored in HttpOnly cookies.
* Protected operations require authentication.
* Product availability and pricing are validated by the backend during checkout.
* Payment signatures are verified on the backend.
* Environment files containing secrets must not be committed to GitHub.
* Razorpay Secret Keys must never be exposed in frontend code.
* Use Razorpay Test Mode for development and academic testing.

Never commit actual MongoDB credentials, JWT secrets, Razorpay secrets, or other private configuration values.

---

## 🔮 Future Improvements

Potential enhancements include:

* Deployment of the frontend and backend.
* Improved product administration and inventory management.
* Product reviews and ratings.
* Pagination and advanced product filtering.
* Automated unit and integration tests.
* Order tracking and additional checkout improvements.

---

## 📄 License

This project was developed for educational purposes as part of a MERN stack lab assignment.

Refer to the repository's applicable license and instructor guidelines before reusing or redistributing the code.
