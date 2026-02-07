from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration - APNA PASSWORD DALO
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '6428',  # YAHAN APNA MYSQL PASSWORD DALO (agar hai toh)
    'database': 'electricity_billing_system'
}

def get_db_connection():
    """Create and return database connection"""
    try:
        conn = mysql.connector.connect(**db_config)
        print("✅ Database connected successfully!")
        return conn
    except mysql.connector.Error as err:
        print(f"❌ Database connection failed: {err}")
        return None

@app.route('/')
def home():
    return jsonify({"message": "Electricity Billing System API is running!", "status": "success"})

@app.route('/api/health')
def health_check():
    conn = get_db_connection()
    if conn:
        conn.close()
        return jsonify({"status": "healthy", "database": "connected"})
    else:
        return jsonify({"status": "healthy", "database": "disconnected"})

# Get all consumers FROM DATABASE
@app.route('/api/consumers', methods=['GET'])
def get_consumers():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM consumers ORDER BY consumer_id DESC")
        consumers = cursor.fetchall()
        
        # Convert date objects to string
        for consumer in consumers:
            if consumer.get('registration_date'):
                consumer['registration_date'] = consumer['registration_date'].isoformat()
        
        print(f"✅ Fetched {len(consumers)} consumers from database")
        return jsonify(consumers)
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

# Add new consumer TO DATABASE
@app.route('/api/consumers', methods=['POST'])
def add_consumer():
    data = request.json
    
    required_fields = ['name', 'address', 'meter_number', 'connection_type']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor()
        
        # Check if meter number already exists
        cursor.execute("SELECT * FROM consumers WHERE meter_number = %s", (data['meter_number'],))
        if cursor.fetchone():
            return jsonify({"error": "Meter number already exists"}), 400
        
        # Insert new consumer
        query = """
        INSERT INTO consumers (name, address, meter_number, connection_type, email, phone, registration_date, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data['name'],
            data['address'],
            data['meter_number'],
            data['connection_type'],
            data.get('email', ''),
            data.get('phone', ''),
            datetime.now().date(),
            'Active'
        )
        
        cursor.execute(query, values)
        conn.commit()
        
        print(f"✅ New consumer added: {data['name']}")
        return jsonify({
            "message": "Consumer added successfully",
            "consumer_id": cursor.lastrowid
        }), 201
        
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

# Get all bills FROM DATABASE
@app.route('/api/bills', methods=['GET'])
def get_bills():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT b.*, c.name as consumer_name, c.meter_number 
            FROM bills b 
            JOIN consumers c ON b.consumer_id = c.consumer_id 
            ORDER BY b.bill_id DESC
        """)
        bills = cursor.fetchall()
        
        # Convert date objects to string
        for bill in bills:
            for date_field in ['bill_date', 'due_date']:
                if bill.get(date_field):
                    bill[date_field] = bill[date_field].isoformat()
        
        print(f"✅ Fetched {len(bills)} bills from database")
        return jsonify(bills)
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

# Generate new bill TO DATABASE
@app.route('/api/bills', methods=['POST'])
def generate_bill():
    data = request.json
    
    required_fields = ['consumer_id', 'bill_date', 'due_date', 'previous_reading', 'current_reading']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Get consumer details
        cursor.execute("SELECT * FROM consumers WHERE consumer_id = %s", (data['consumer_id'],))
        consumer = cursor.fetchone()
        
        if not consumer:
            return jsonify({"error": "Consumer not found"}), 404
        
        # Calculate units and amount
        units_consumed = data['current_reading'] - data['previous_reading']
        if units_consumed < 0:
            return jsonify({"error": "Current reading must be greater than previous reading"}), 400
        
        amount = calculate_bill_amount(units_consumed, consumer['connection_type'])
        
        # Insert bill
        query = """
        INSERT INTO bills (consumer_id, bill_date, due_date, previous_reading, current_reading, units_consumed, amount, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data['consumer_id'],
            data['bill_date'],
            data['due_date'],
            data['previous_reading'],
            data['current_reading'],
            units_consumed,
            amount,
            'Pending'
        )
        
        cursor.execute(query, values)
        conn.commit()
        
        print(f"✅ New bill generated for consumer {data['consumer_id']}")
        return jsonify({
            "message": "Bill generated successfully",
            "bill_id": cursor.lastrowid,
            "units_consumed": units_consumed,
            "amount": amount
        }), 201
        
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def calculate_bill_amount(units, connection_type):
    """Calculate bill amount based on units and connection type"""
    amount = 0
    
    if connection_type == 'Domestic':
        if units <= 100:
            amount = units * 3.0
        elif units <= 300:
            amount = 100 * 3.0 + (units - 100) * 5.0
        else:
            amount = 100 * 3.0 + 200 * 5.0 + (units - 300) * 7.0
    else:  # Commercial
        if units <= 100:
            amount = units * 5.0
        elif units <= 300:
            amount = 100 * 5.0 + (units - 100) * 8.0
        else:
            amount = 100 * 5.0 + 200 * 8.0 + (units - 300) * 10.0
    
    # Add GST and fixed charges
    amount += amount * 0.18  # 18% GST
    amount += 50  # Fixed charges
    
    return round(amount, 2)

# Get all payments FROM DATABASE
@app.route('/api/payments', methods=['GET'])
def get_payments():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT p.*, b.bill_id, c.name as consumer_name 
            FROM payments p 
            JOIN bills b ON p.bill_id = b.bill_id 
            JOIN consumers c ON b.consumer_id = c.consumer_id 
            ORDER BY p.payment_id DESC
        """)
        payments = cursor.fetchall()
        
        # Convert date objects to string
        for payment in payments:
            if payment.get('payment_date'):
                payment['payment_date'] = payment['payment_date'].isoformat()
        
        print(f"✅ Fetched {len(payments)} payments from database")
        return jsonify(payments)
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

# Record payment TO DATABASE
@app.route('/api/payments', methods=['POST'])
def record_payment():
    data = request.json
    
    required_fields = ['bill_id', 'payment_date', 'amount_paid', 'payment_method', 'received_by']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor()
        
        # Insert payment
        query = """
        INSERT INTO payments (bill_id, payment_date, amount_paid, payment_method, transaction_id, received_by)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        values = (
            data['bill_id'],
            data['payment_date'],
            data['amount_paid'],
            data['payment_method'],
            data.get('transaction_id', ''),
            data['received_by']
        )
        
        cursor.execute(query, values)
        
        # Update bill status to Paid
        update_bill_query = "UPDATE bills SET status = 'Paid' WHERE bill_id = %s"
        cursor.execute(update_bill_query, (data['bill_id'],))
        
        conn.commit()
        
        print(f"✅ Payment recorded for bill {data['bill_id']}")
        return jsonify({
            "message": "Payment recorded successfully",
            "payment_id": cursor.lastrowid
        }), 201
        
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

# Dashboard statistics FROM DATABASE
@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Total consumers
        cursor.execute("SELECT COUNT(*) as total FROM consumers WHERE status = 'Active'")
        total_consumers = cursor.fetchone()['total']
        
        # Total bills
        cursor.execute("SELECT COUNT(*) as total FROM bills")
        total_bills = cursor.fetchone()['total']
        
        # Total revenue
        cursor.execute("SELECT COALESCE(SUM(amount_paid), 0) as total FROM payments")
        total_revenue = cursor.fetchone()['total']
        
        # Pending bills
        cursor.execute("SELECT COUNT(*) as total FROM bills WHERE status = 'Pending'")
        pending_bills = cursor.fetchone()['total']
        
        # Collection rate
        cursor.execute("""
            SELECT 
                ROUND((SELECT COUNT(*) FROM bills WHERE status = 'Paid') * 100.0 / 
                NULLIF((SELECT COUNT(*) FROM bills), 0), 2) as rate
        """)
        collection_rate = cursor.fetchone()['rate'] or 0
        
        print("✅ Dashboard stats fetched from database")
        return jsonify({
            "total_consumers": total_consumers,
            "total_bills": total_bills,
            "total_revenue": float(total_revenue),
            "pending_bills": pending_bills,
            "collection_rate": float(collection_rate)
        })
        
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)