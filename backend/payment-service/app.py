import os
import json
import requests
import mysql.connector
from flask import Flask, request, jsonify
from flask_cors import CORS
import pika

app = Flask(__name__)
CORS(app)

def get_db():
    return mysql.connector.connect(
        host=os.environ.get("DB_HOST", "mysql-db"),
        user="root",
        password="root123",
        database="ecommerce"
    )

def publish_to_rabbitmq(message):
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host='rabbitmq')
        )
        channel = connection.channel()
        channel.queue_declare(queue='payment_processed')
        channel.basic_publish(
            exchange='',
            routing_key='payment_processed',
            body=json.dumps(message)
        )
        connection.close()
        return True
    except Exception as e:
        print(f"RabbitMQ error: {e}")
        return False

# GET - All payments (Order history for admin)
@app.route('/payments', methods=['GET'])
def get_payments():
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM payments ORDER BY created_at DESC")
        items = cursor.fetchall()
        return jsonify(items)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# POST - Process payment
@app.route('/payment', methods=['POST'])
def process_payment():
    try:
        data = request.json
        product_id = data.get('product_id')
        quantity = data.get('quantity', 1)
        discount_code = data.get('discount_code', None)
        
        # New: Customer details
        customer_name = data.get('customer_name', 'Guest')
        customer_email = data.get('customer_email', '')
        customer_phone = data.get('customer_phone', '')
        customer_address = data.get('customer_address', '')
        customer_city = data.get('customer_city', '')

        if not product_id:
            return jsonify({"error": "Product ID is required"}), 400

        # Get product from inventory
        inv_response = requests.get(f"http://inventory:5001/inventory/{product_id}")
        if inv_response.status_code != 200:
            return jsonify({"error": "Product not found"}), 404

        product = inv_response.json()
        original_price = float(product['price']) * quantity
        discount_amount = 0
        final_amount = original_price

        # Apply discount if code provided
        if discount_code:
            disc_response = requests.post(
                "http://discount:5003/discount",
                json={"code": discount_code, "original_price": original_price}
            )
            if disc_response.status_code == 200:
                disc_data = disc_response.json()
                discount_amount = disc_data.get('discount_amount', 0)
                final_amount = disc_data.get('final_price', original_price)

        # Update inventory FIRST (Stock reservation)
        inv_update_res = requests.put(
            f"http://inventory:5001/inventory/{product_id}",
            json={"quantity": quantity}
        )
        
        if inv_update_res.status_code != 200:
            return jsonify({"error": "Stock update failed or insufficient quantity"}), 400

        # Save payment to DB
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            """INSERT INTO payments 
            (product_id, product_name, quantity, original_price, discount_applied, final_amount, status,
             customer_name, customer_email, customer_phone, customer_address, customer_city)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (product_id, product['name'], quantity, original_price, discount_amount, final_amount, 'success',
             customer_name, customer_email, customer_phone, customer_address, customer_city)
        )
        db.commit()

        # Publish to RabbitMQ
        message = {
            "product_id": product_id,
            "product_name": product['name'],
            "quantity": quantity,
            "final_amount": final_amount,
            "status": "success",
            "customer_email": customer_email
        }
        publish_to_rabbitmq(message)

        return jsonify({
            "message": "Payment successful",
            "product": product['name'],
            "quantity": quantity,
            "final_amount": final_amount,
            "status": "success"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5004, debug=True)
