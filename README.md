```md
# 🛡️ SafeDeal — Secure Escrow Web Platform

## 📌 Project Description

**SafeDeal** is a web application designed to ensure **safe online transactions** between buyers and sellers.  
The platform acts as a **trusted intermediary (escrow system)** that temporarily holds funds until both parties confirm that the transaction is successfully completed.

This helps prevent common online scams where:
- Buyers send money but never receive the product  
- Sellers ship products but never receive payment  

---

## 🚀 Key Features

- 🔐 User Registration & Authentication (JWT-based)
- 🤝 Deal Creation between Buyer and Seller
- 💰 Escrow Payment System (simulated wallet)
- 📦 Deal Status Tracking
- ⭐ User Rating & Trust Score System
- ⚠️ Dispute Handling System
- 📜 Transaction History

---

## 🔄 How It Works

1. **Seller creates a deal** (product, price, buyer)
2. **Buyer confirms participation**
3. **Buyer sends payment to escrow**
4. **Seller ships the product**
5. **Buyer confirms delivery**
6. **System releases money to seller**

If something goes wrong, a **dispute** can be opened.

---

## 🏗️ Tech Stack

- Frontend: Angular  
- Backend: Django + Django REST Framework  
- Database: PostgreSQL  

---

## 📂 Project Structure

```

/frontend   → Angular application
/backend    → Django REST API

```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```

git clone []()
cd safedeal

```

---

### 2️⃣ Backend Setup (Django)

```

cd backend
python -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

```

---

### 3️⃣ Frontend Setup (Angular)

```

cd frontend
npm install
ng serve

```

Frontend will run on:
```

[http://localhost:4200](http://localhost:4200)

```

---

## 🔐 Authentication

The system uses **JWT (JSON Web Token)** authentication:
- Login returns access token
- Token is used for all protected API requests

---

## 📡 API Overview

### Authentication
- `POST /api/register`
- `POST /api/login`

### Deals
- `GET /api/deals`
- `POST /api/deals`
- `PUT /api/deals/{id}`
- `DELETE /api/deals/{id}`

### Transactions
- `POST /api/deals/{id}/pay`
- `POST /api/deals/{id}/confirm`

---

## 📊 Database Models

- User  
- Deal  
- Transaction  
- Rating  
- (Optional) Shipment  
- (Optional) Dispute  

---

## 👥 Team Members

- **Sauranbay Kanagat — 24B032003**  
- **Sagat Alikhan — 24B031983**  
- **Nurila Salamat — 24B031994**  

---

## 🕒 Schedule

- **Lecture Time:** Monday 15:00–17:00  
- **Practice Time:** 15:00–17:00  

---

## 🎯 Project Goals

- Build a full-stack web application using Angular and Django  
- Implement RESTful API with authentication  
- Design a relational database using PostgreSQL  
- Solve a real-world problem (online transaction safety)  

---

## 📌 Notes

- Payments are simulated (no real money transactions)
- Designed for educational purposes
- Follows course requirements for Web Development at KBTU

---

## 📈 Future Improvements

- Real payment gateway integration  
- Delivery tracking API  
- Mobile application  
- Advanced fraud detection system  

---

## 📄 License

This project is developed for academic purposes at KBTU.
```
# SafeDeal
