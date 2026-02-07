⚡ Electricity Billing System
A complete web-based solution for managing electricity billing operations with automated calculations, customer management, and invoice generation.

📋 Table of Contents
Features

Technology Stack

Project Structure

Installation Guide

How to Run

Screenshots

Usage Guide

API Reference

✨ Features
Customer Management: Add, view, edit, and delete customer records

Automated Bill Calculation: Smart calculation based on consumption units

Invoice Generation: Professional invoice creation and printing

Payment Tracking: Monitor payment status in real-time

Admin Dashboard: Visual analytics and key metrics

Multi-theme Support: Light and dark mode options

Responsive Design: Works perfectly on all devices

Report Generation: Generate various billing reports

🏗️ Technology Stack
Frontend
HTML5 - Page structure and markup

CSS3 - Styling with custom themes and animations

JavaScript (ES6+) - Client-side functionality

Backend
Python Flask - Lightweight web framework

RESTful APIs - Clean API architecture

Database
MySQL - Relational database for data storage

📁 Project Structure
text
ElectricityBillingSystem/
├── backend/
│   ├── app.py                    # Flask application server
│   ├── models/                   # Data models
│   ├── routes/                   # API endpoints
│   ├── utils/                    # Helper functions
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── index.html               # Main dashboard page
│   ├── css/
│   │   ├── style.css            # Main stylesheet
│   │   ├── dashboard.css        # Dashboard styles
│   │   └── themes.css           # Theme configurations
│   ├── js/                      # JavaScript files
│   ├── pages/                   # Additional HTML pages
│   ├── images/                  # UI images and icons
│   └── assets/                  # Other frontend assets
├── Screenshots/                  # Application screenshots
│   ├── dashboard.png            # Dashboard view
│   ├── customer_management.png  # Customer page
│   ├── bill_generation.png      # Bill creation
│   └── reports.png              # Reports view
└── README.md                    # This documentation file
🚀 Installation Guide
Prerequisites
Python 3.8 or higher

MySQL Server installed

Web browser (Chrome, Firefox, Edge)

Step-by-Step Setup
Clone the Project

bash
git clone https://github.com/akhilbhai800/ElectricityBillingSystem.git
cd ElectricityBillingSystem
Setup Backend

bash
cd backend
pip install flask mysql-connector-python
Configure Database

python
# Update database settings in backend/app.py
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',  # Your MySQL password
    'database': 'electricity_billing'
}
Create Database

sql
CREATE DATABASE electricity_billing;
💻 How to Run
Starting Backend Server
bash
cd backend
python app.py
Server runs at: http://127.0.0.1:5000

Accessing Frontend
Open frontend/index.html directly in your browser or use:

bash
cd frontend
# Using Python HTTP server
python -m http.server 8000
Then visit: http://localhost:8000

📸 Screenshots
The project includes comprehensive screenshots in the Screenshots/ folder:

Dashboard Overview - Main admin dashboard with analytics

Customer Management - Interface for managing customer data

Bill Generation - Form for creating electricity bills

Payment Tracking - Payment status and history

Reports Section - Various billing and consumption reports

User Profile - User account management

(View all screenshots in the Screenshots directory)

🎯 Usage Guide
For Administrators
Login to Dashboard

Open the application in browser

Navigate to admin panel

Manage Customers

Add new customers with details

View existing customer list

Edit or remove customer information

Generate Bills

Select customer

Enter meter readings

System auto-calculates amount

Generate and print invoice

Track Payments

Record customer payments

View payment history

Generate pending payment reports

Bill Calculation
The system uses progressive tariff:

First 100 units: ₹3 per unit

101-200 units: ₹4.50 per unit

201-300 units: ₹6 per unit

Above 300 units: ₹7.50 per unit

🔌 API Reference
Base URL
text
http://localhost:5000
Status Check
http
GET /
Response:

json
{
  "message": "Electricity Billing System API is running!",
  "status": "success"
}
Health Check
http
GET /api/health
Checks database connection status

Customer APIs
http
GET    /api/customers          # List all customers
POST   /api/customers          # Create new customer
GET    /api/customers/{id}     # Get specific customer
PUT    /api/customers/{id}     # Update customer
DELETE /api/customers/{id}     # Delete customer
Bill APIs
http
GET    /api/bills             # Get all bills
POST   /api/bills             # Create new bill
GET    /api/bills/{id}        # Get specific bill
PUT    /api/bills/status/{id} # Update bill status
🛠️ Development
Project Status
✅ Backend: Fully functional Flask API
✅ Frontend: Complete responsive interface
✅ Database: MySQL integration working
✅ Features: All core features implemented

Running Tests
bash
# Test backend API
curl http://localhost:5000/

# Test database connection
curl http://localhost:5000/api/health
File Locations
Main Entry Point: frontend/index.html

Backend Server: backend/app.py

Database Config: backend/app.py (db_config)

CSS Files: frontend/css/ directory

JavaScript: frontend/js/ directory

Screenshots: Screenshots/ directory

🔧 Troubleshooting
Common Issues
Backend not starting

bash
# Check Python installation
python --version

# Check Flask installation
pip show flask

# Run from correct directory
cd backend && python app.py
Database connection error

Ensure MySQL service is running

Verify database credentials

Create database if not exists

Frontend not loading

Check if backend is running

Open browser console for errors

Verify file paths in HTML

Port already in use

python
# Change port in app.py
app.run(debug=True, port=5001)
Logs and Debugging
Backend logs appear in terminal

Browser Dev Tools (F12) show frontend errors

Check network tab for API calls

📦 Dependencies
Python Packages (backend/requirements.txt)
text
flask==2.3.3
mysql-connector-python==8.1.0
Frontend Libraries
Chart.js (for graphs and charts)

Font Awesome (icons)

Google Fonts (typography)

📄 License
This project is available for educational and personal use.

👤 Author
Akhilesh Yadav
GitHub: @akhilbhai800

Quick Start Commands
bash
# Clone repository
git clone https://github.com/akhilbhai800/ElectricityBillingSystem.git

# Setup and run
cd ElectricityBillingSystem/backend
pip install -r requirements.txt
python app.py

# Access application
# Backend: http://localhost:5000
# Frontend: frontend/index.html
Project Completion Status
Backend API Development

Frontend Interface

Database Integration

Core Features Implementation

Documentation

Screenshots Collection
