

---

```markdown
# 🛡️ SafeDeal — Secure Escrow Web Platform

## 📌 Project Description

**SafeDeal** is a web application designed to ensure **safe online transactions** between buyers and sellers.  
The platform acts as a **trusted intermediary (escrow system)** that temporarily holds funds until both parties confirm that the transaction is successfully completed.

This helps prevent common online scams where:
- Buyers send money but never receive the product.
- Sellers ship products but never receive payment.

---

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
| **Database** | PostgreSQL |
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

### Authentication
* `POST /api/register` — Create a new account
* `POST /api/login` — Obtain JWT access tokens

### Deals
* `GET /api/deals` — List all user deals
* `POST /api/deals` — Initiate a new deal
* `PUT /api/deals/{id}` — Update deal status
* `DELETE /api/deals/{id}` — Cancel a deal

### Transactions
* `POST /api/deals/{id}/pay` — Deposit money into escrow
* `POST /api/deals/{id}/confirm` — Release money to seller

---

## 📊 Database Models

* **User:** Profiles, balances, and trust ratings.
* **Deal:** Core deal data (Buyer, Seller, Price, Status).
* **Transaction:** Ledger of all fund movements.
* **Rating:** Feedback left by users after completion.
* **(Optional) Dispute:** Log for contested transactions.

---

## 👥 Team Members

* **Sauranbay Kanagat** — 24B032003
* **Sagat Alikhan** — 24B031983
* **Nurila Salamat** — 24B031994

---

## 🕒 Course Schedule

* **Lecture Time:** Monday 15:00–17:00
* **Practice Time:** Monday 17:00–19:00

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
```

Would you like me to generate a `.gitignore` file for your project to keep your `venv` and `node_modules` out of the repository?