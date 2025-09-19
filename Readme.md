# 🎱 BilliardsOne – Modern Billiards Cafe Management App  

BilliardsOne is a **full-stack web application** designed to modernize and streamline the operations of pool and billiards cafes.  
It provides:  
- A comprehensive suite of tools for **owners** to manage their business efficiently.  
- A simple, intuitive interface for **staff** to handle daily operations.  

All built with a **mobile-first philosophy**.  

---

## ✨ Features  

The application is divided into two primary user roles, each with a dedicated dashboard and functionalities.  

---

### 🤵 Owner Features  

The **Owner Dashboard** provides a high-level overview and access to all management tools.  

- **Role-Based Access Control (RBAC):** Owners have exclusive access to management and financial analytics, ensuring data security.  
- **Multi-Cafe Management:** Create and manage multiple cafe branches from a single account.  
- **Flexible Billing Strategy:** Choose from different billing models per cafe:  
  - **Pro-Rata:** Base fee for the first 30 minutes + per-minute rate thereafter.  
  - **Per-Minute:** Flat rate per minute from the start.  
  - **Fixed-Hour:** Traditional model that rounds up to the next full hour.  
- **Staff Management:** Add, view, and manage staff members.  
- **Table & Pricing Management:** Add tables (8-Ball Pool, Snooker) with custom pricing (hourly, half-hourly, extra player charges).  
- **Detailed Analytics:** Filterable reports (daily, weekly, monthly) for performance and finances.  

---

### 🧑‍💼 Staff Features  

The **Staff Dashboard** is optimized for speed and efficiency in daily operations.  

- **Live Dashboard:** Real-time grid view of all tables and statuses (Available, In Use).  
- **Dynamic Session Timers:** Live ticking clocks for tables in use.  
- **Session Management:**  
  - Start new game sessions.  
  - Update player count mid-session.  
  - End sessions with auto bill calculation based on billing strategy.  
- **Comprehensive Billing:** Transparent bill breakdown with base charges, overtime, and extra player fees.  
- **Payment Logging:** Record payments (Cash or Online).  
- **Daily Reports:** Personal payment history and daily performance summary.  

---

### 👑 Smart Switch (Owner → Staff Mode)  

A unique feature that allows an **owner to seamlessly "Act as Staff"** without needing a separate staff account.  

- Perfect for **solo operations** or when owners need to manage the floor directly.  
- Provides a **temporary staff token** with a simple option to switch back to the owner view.  

---

## 🛠️ Tech Stack  

- **Frontend:** React (Vite), JavaScript, Tailwind CSS  
- **Backend:** FastAPI (Python), SQLAlchemy ORM  
- **Database:** PostgreSQL  
- **Schema Validation:** Pydantic  
- **Database Migrations:** Alembic  

---

## 🚀 Local Setup & Installation  

You will need **Python**, **Node.js**, and a **PostgreSQL** database installed.  

---

### 1️⃣ Backend Setup  

```bash
# Clone the repository
git clone <your-repo-url>
cd billiards-one/backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file with your configuration:

```env
DATABASE_URL=postgresql://user:password@localhost/billiards_db
SECRET_KEY=your_super_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Run database migrations and start the server:

```bash
alembic upgrade head
uvicorn main:app --reload
```

Backend runs at **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

### 2️⃣ Frontend Setup

```bash
# From the root directory
cd ../frontend

# Install dependencies
npm install
```

Create a `.env` file for the API URL:

```env
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

Run the development server:

```bash
npm run dev
```

---
