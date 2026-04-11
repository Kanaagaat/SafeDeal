
---
# 🛡️ SafeDeal — Secure Escrow Web Platform

## 📌 Project Description

**SafeDeal** is a web application designed to ensure **safe online transactions** between buyers and sellers.  
The platform acts as a **trusted intermediary (escrow system)** that temporarily holds funds until both parties confirm that the transaction is successfully completed.

This helps prevent common online scams where:
- Buyers send money but never receive the product.
- Sellers ship products but never receive payment.

---

## 👥 Team Members

* **Sauranbay Kanagat** — 24B032003
* **Sagat Alikhan** — 24B031983
* **Nurila Salamat** — 24B031994

---

## 🕒 Course Schedule

* **Lecture Time:** Monday 15:00–17:00
* **Practice Time:** Monday 17:00–19:00




## 🚀 Key Features

* **🔐 Authentication:** User Registration & Login (JWT-based).
* **🤝 Deal Management:** Create and manage deals between Buyers and Sellers.
* **💰 Escrow System:** Simulated wallet to hold funds securely.
* **📦 Tracking:** Real-time deal status tracking.
* **⭐ Trust System:** User Rating & Trust Score.
* **⚠️ Dispute Handling:** Dedicated system for conflict resolution.
* **📜 History:** Full transaction and activity logs.

---

## 🔄 How It Works

1.  **Deal Creation:** Seller creates a deal (listing product, price, and buyer).
2.  **Confirmation:** Buyer confirms participation in the deal.
3.  **Escrow Deposit:** Buyer sends the payment to the secure escrow wallet.
4.  **Shipping:** Seller ships the product to the buyer.
5.  **Release:** Buyer confirms delivery; the system releases funds to the seller.

> [!IMPORTANT]
> If a dispute arises at any stage, the funds remain locked in escrow until a resolution is reached.

---

## 🏗️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Angular |
| **Backend** | Django + Django REST Framework |
| **Database** | SQLite |
| **Auth** | JWT (JSON Web Token) |

---

## 📂 Project Structure

```text
.
├── /frontend      # Angular application
├── /backend       # Django REST API
└── README.md      # Project documentation
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone [https://github.com/Kanaagaat/SafeDeal/tree/main](https://github.com/Kanaagaat/SafeDeal/tree/main)
cd safedeal
```

### 2️⃣ Backend Setup (Django)
```bash
cd backend
python -m venv venv

# Activate Virtual Environment
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Install Dependencies & Run
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3️⃣ Frontend Setup (Angular)
```bash
cd frontend
npm install
ng serve
```
The frontend will be available at: `http://localhost:4200`

---

## 📡 API Overview

### 🔐 Authentication
| Method | Endpoint | Description |
|:--- |:--- |:--- |
| `POST` | `/api/register/` | Create a new account & receive JWT tokens |
| `POST` | `/api/login/` | Authenticate & obtain JWT access/refresh tokens |
| `POST` | `/api/logout/` | Blacklist refresh token to end session |
| `POST` | `/api/token/refresh/` | Refresh expired access tokens |

### 👤 User & Wallet
| Method | Endpoint | Description |
|:--- |:--- |:--- |
| `GET` | `/api/user/profile/` | Get current user details & trust score |
| `GET` | `/api/user/balance/` | View `balance` and `escrow_balance` |
| `POST` | `/api/user/add-funds/` | Deposit money to personal balance |

### 🤝 Deal Management
| Method | Endpoint | Description |
|:--- |:--- |:--- |
| `GET` | `/api/deals/` | List all deals (as Buyer or Seller) |
| `POST` | `/api/deals/` | Initiate a new deal as a Seller |
| `GET` | `/api/deals/{id}/` | Get full deal details & status |
| `POST` | `/api/deals/{id}/cancel-deal/` | Cancel a deal (Only if status is `CREATED`) |
| `POST` | `/api/deals/{id}/open-dispute/` | Raise a dispute for an active deal |

### 💸 Transactions (Escrow Flow)
| Method | Endpoint | Description |
|:--- |:--- |:--- |
| `GET` | `/api/transactions/` | View full history of all financial movements |
| `POST` | `/api/transactions/pay/` | **Buyer:** Move funds from balance to Escrow |
| `POST` | `/api/transactions/confirm/` | **Buyer:** Release Escrow funds to the Seller |

### ⭐️ Ratings & Reputation
| Method | Endpoint | Description |
|:--- |:--- |:--- |
| `GET` | `/api/ratings/?user_id={id}` | Get all feedback for a specific user |
| `POST` | `/api/ratings/` | Rate the seller (Allowed after deal completion) |

---

## 🛠 Technical Implementation Details

### **Financial Security**
- **Escrow Logic:** When a buyer "Pays," funds are locked in the `escrow_balance`. Neither the buyer nor the seller can withdraw these funds until the deal is `COMPLETED` or `CANCELLED`.
- **Atomic Transactions:** All balance updates are wrapped in `transaction.atomic()` to prevent data corruption during server errors.
- **Precision:** Uses `DecimalField` for all currency values to prevent floating-point rounding errors.

### **Deal Lifecycle**
1. **CREATED:** Deal is listed but not yet funded.
2. **SHIPPED:** Buyer has funded the escrow; seller is expected to deliver.
3. **DELIVERED:** Product received; waiting for final buyer confirmation.
4. **COMPLETED:** Funds released to Seller; deal archived.
5. **DISPUTED:** Admin intervention required.

### **Authentication**
All protected endpoints require the following header:
`Authorization: Bearer <your_access_token>`

---




## 📊 Database Models

* **User:** Profiles, balances, and trust ratings.
* **Deal:** Core deal data (Buyer, Seller, Price, Status).
* **Transaction:** Ledger of all fund movements.
* **Rating:** Feedback left by users after completion.
* **(Optional) Dispute:** Log for contested transactions.

---

## 🎯 Project Goals

* Build a full-stack web application using **Angular** and **Django**.
* Implement a secure **RESTful API** with token authentication.
* Design a robust relational database using **PostgreSQL**.
* Solve a real-world problem regarding online transaction safety at **KBTU**.

---

## 📈 Future Improvements

* Integration with real payment gateways (Stripe/PayPal).
* Delivery tracking via third-party APIs.
* Mobile application development.
* AI-driven fraud detection.

---

## 📄 License

This project is developed for academic purposes at **Kazakh-British Technical University (KBTU)**.
