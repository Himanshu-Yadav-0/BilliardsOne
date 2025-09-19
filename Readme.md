BilliardsOne - Modern Billiards Cafe Management App

BilliardsOne is a full-stack web application designed to modernize and streamline the operations of pool and billiards cafes. It provides a comprehensive suite of tools for owners to manage their business efficiently and a simple, intuitive interface for staff to handle daily operations, all built with a mobile-first philosophy.
✨ Features

The application is divided into two primary user roles, each with a dedicated dashboard and functionalities.
🤵 Owner Features

The owner dashboard provides a high-level overview and access to all management tools.

    Role-Based Access Control (RBAC): Owners have exclusive access to management and financial analytics, ensuring data security.

    Multi-Cafe Management: Owners can create and manage multiple cafe branches from a single account.

    Flexible Billing Strategy: For each cafe, owners can choose from different billing models to suit their business needs:

        Pro-Rata: A customer-friendly model that charges a base fee for the first 30 minutes and a per-minute rate thereafter.

        Per-Minute: A simple and precise model that charges a flat rate per minute from the start.

        Fixed-Hour: The traditional model that rounds up the bill to the next full hour.

    Staff Management: Add, view, and manage staff members for each cafe.

    Table & Pricing Management: Add tables (8-Ball Pool, Snooker) and set specific pricing rules for each, including hourly rates, half-hourly rates, and extra player charges.

    Detailed Analytics: View comprehensive financial reports for any cafe, with filters for daily, weekly, and monthly performance.

🧑‍💼 Staff Features

The staff dashboard is designed for speed and efficiency in daily operations.

    Live Dashboard: A real-time grid view of all tables showing their current status (Available, In Use).

    Dynamic Session Timers: Tables that are in use display a live, ticking clock showing the elapsed session time.

    Session Management:

        Start new game sessions for available tables.

        Update the player count for an ongoing session.

        End sessions to trigger automatic, accurate bill calculation based on the cafe's billing strategy.

    Comprehensive Billing: The app generates a detailed bill breakdown, including base charges, overtime costs, and extra player fees, ensuring transparency for the customer.

    Payment Logging: Securely log payments with options for Cash or Online methods.

    Daily Reports: Staff can view their personal payment history and a summary of their performance for the current day.

👑 "Smart Switch" Feature for Owners

A unique feature that allows a cafe owner to seamlessly "Act as Staff" for any of their cafes without needing a separate staff account. This is perfect for single-person operations or for owners who need to manage the floor themselves. The system provides a temporary staff token with an option to easily switch back to the owner view.
🛠️ Tech Stack

    Frontend: React (with Vite), JavaScript, Tailwind CSS

    Backend: FastAPI (Python), SQLAlchemy ORM

    Database: PostgreSQL

    Schema Validation: Pydantic

    Database Migrations: Alembic

🚀 Local Setup and Installation

To run this project locally, you will need Python, Node.js, and a PostgreSQL database installed.
1. Backend Setup

# Clone the repository
git clone <your-repo-url>
cd billiards-one/backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt

# Create a .env file and add your database URL and a secret key
# Example .env file:
# DATABASE_URL=postgresql://user:password@localhost/billiards_db
# SECRET_KEY=your_super_secret_key
# ALGORITHM=HS256
# ACCESS_TOKEN_EXPIRE_MINUTES=60

# Run database migrations to create the tables
alembic upgrade head

# Run the backend server
uvicorn main:app --reload

The backend will be running at http://127.0.0.1:8000.
2. Frontend Setup

# Navigate to the frontend directory from the root
cd ../frontend

# Install dependencies
npm install

# Create a .env file for the API URL
# Example .env file:
# VITE_API_URL=[http://127.0.0.1:8000/api/v1](http://127.0.0.1:8000/api/v1)

# Run the frontend development server
npm run dev

