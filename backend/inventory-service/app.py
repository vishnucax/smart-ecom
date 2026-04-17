from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import os

app = Flask(__name__)
CORS(app)

def get_db():
    return mysql.connector.connect(
        host=os.environ.get("DB_HOST", "mysql-db"),
        user="root",
        password="root123",
        database="ecommerce"
    )

# POST - Admin Login
@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    password = data.get('password')
    email = data.get('email')

    # Hardcoded credentials as requested
    if password == "admin" and email == "admin@gmail.com":
        return jsonify({"message": "Login successful", "token": "fake-admin-token"}), 200
    return jsonify({"error": "Invalid credentials"}), 401

# POST - Add new inventory item
@app.route('/inventory', methods=['POST'])
def add_item():
    try:
        data = request.json
        name = data.get('name')
        price = data.get('price')
        quantity = data.get('quantity')
        image_url = data.get('image_url', '')
        
        if not name or price is None or quantity is None:
            return jsonify({"error": "Missing required fields"}), 400

        # Input Validation
        if float(price) < 0:
            return jsonify({"error": "Price cannot be negative"}), 400
        if int(quantity) < 0:
            return jsonify({"error": "Quantity cannot be negative"}), 400

        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO inventory (name, price, quantity, image_url) VALUES (%s, %s, %s, %s)",
            (name, price, quantity, image_url)
        )
        db.commit()
        return jsonify({"message": "Item added", "id": cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# GET - Get specific item
@app.route('/inventory/<int:item_id>', methods=['GET'])
def get_item(item_id):
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM inventory WHERE id = %s", (item_id,))
        item = cursor.fetchone()
        if not item:
            return jsonify({"error": "Item not found"}), 404
        return jsonify(item)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# GET ALL - Get all items
@app.route('/inventory', methods=['GET'])
def get_all_items():
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM inventory ORDER BY name ASC")
        items = cursor.fetchall()
        return jsonify(items)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# PUT - Full update or quantity adjust
@app.route('/inventory/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    try:
        data = request.json
        db = get_db()
        cursor = db.cursor()

        # If full update (Admin)
        if 'full_update' in data and data['full_update']:
            # Input Validation
            if float(data['price']) < 0:
                return jsonify({"error": "Price cannot be negative"}), 400
            if int(data['quantity']) < 0:
                return jsonify({"error": "Quantity cannot be negative"}), 400

            cursor.execute(
                "UPDATE inventory SET name = %s, price = %s, quantity = %s, image_url = %s WHERE id = %s",
                (data['name'], data['price'], data['quantity'], data.get('image_url', ''), item_id)
            )
        else:
            # Stock adjustment (Frontend/Checkout)
            # Ensure quantity being subtracted is valid
            sub_quantity = int(data.get('quantity', 0))
            if sub_quantity <= 0:
                return jsonify({"error": "Invalid adjustment quantity"}), 400

            cursor.execute(
                "UPDATE inventory SET quantity = quantity - %s WHERE id = %s AND quantity >= %s",
                (sub_quantity, item_id, sub_quantity)
            )
        
        db.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Insufficient stock or item not found"}), 400
        return jsonify({"message": "Inventory updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# DELETE - Remove inventory item
@app.route('/inventory/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("DELETE FROM inventory WHERE id = %s", (item_id,))
        db.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Item not found"}), 404
        return jsonify({"message": "Item deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
