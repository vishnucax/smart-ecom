# 🛒 Smart E-Commerce Checkout Workflow

> A backend microservices system simulating a real-world e-commerce checkout pipeline — built without any UI, demonstrated entirely through API calls.

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-REST%20API-lightgrey?logo=flask)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?logo=mysql)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3-red?logo=rabbitmq)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue?logo=docker)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📌 Overview

This project connects multiple independent microservices into a complete e-commerce checkout flow — similar to how **Amazon** or **Flipkart** handles cart, discount, payment, and inventory behind the scenes.

Built as part of the **Cloud Computing** subject assignment for **MCA**.

### Checkout Flow
```
Cart Service → Discount Service → Payment Service → Inventory Update → RabbitMQ Event
```

---

## 🧱 System Architecture
```
                        CLIENT (Postman)
                              |
          ┌───────────────────┼───────────────────┐
          │                   │                   │
    Port 5001           Port 5002           Port 5003
          │                   │                   │
  ┌───────┴──────┐    ┌───────┴──────┐    ┌───────┴──────┐
  │  Inventory   │    │     Cart     │    │   Discount   │
  │   Service    │    │   Service    │    │   Service    │
  └──────────────┘    └──────────────┘    └──────────────┘

                            Port 5004
                      ┌───────┴──────┐
                      │   Payment    │
                      │   Service    │
                      └──────┬───────┘
                             │
               ┌─────────────┴─────────────┐
               │                           │
        ┌──────┴──────┐           ┌────────┴───────┐
        │    MySQL    │           │   RabbitMQ     │
        │  Port 3306  │           │   Port 5672    │
        └─────────────┘           └────────────────┘
```

---

## ⚙️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Python + Flask | 3.11 | Microservice REST APIs |
| MySQL | 8.0 | Persistent database storage |
| RabbitMQ | 3 | Asynchronous event messaging |
| Docker | Latest | Service containerization |
| Postman | Latest | API testing & demonstration |

---

## 📁 Project Structure
```
smart-ecommerce-checkout/
├── 📂 db-init/
│   └── init.sql                  ← Database schema + seed data
├── 📂 inventory-service/
│   ├── app.py                    ← CRUD APIs for products & stock
│   ├── requirements.txt
│   └── Dockerfile
├── 📂 cart-service/
│   ├── app.py                    ← Add items, view cart
│   ├── requirements.txt
│   └── Dockerfile
├── 📂 discount-service/
│   ├── app.py                    ← Serverless-style coupon logic
│   ├── requirements.txt
│   └── Dockerfile
├── 📂 payment-service/
│   ├── app.py                    ← Payment + RabbitMQ publisher
│   ├── requirements.txt
│   └── Dockerfile
├── 📂 screenshots/               ← Demo screenshots
├── 📄 README.md
└── 📄 LICENSE
```

---

## 🚀 Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Postman](https://www.postman.com/downloads/) for API testing

### 1. Clone the Repository
```
git clone https://github.com/albin-shaji/smart-ecommerce-checkout.git
cd smart-ecommerce-checkout
```

### 2. Create Docker Network
```
docker network create ecommerce-net
```

### 3. Start Infrastructure
```
docker run -d --name mysql-db --network ecommerce-net -e MYSQL_ROOT_PASSWORD=root123 -e MYSQL_DATABASE=ecommerce -p 3306:3306 mysql:8.0

docker run -d --name rabbitmq --network ecommerce-net -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

### 4. Initialize Database
```
docker exec -i mysql-db mysql -uroot -proot123 < db-init/init.sql
```

### 5. Build & Run All Services
```
docker build -t inventory-service ./inventory-service
docker run -d --name inventory --network ecommerce-net -p 5001:5001 inventory-service

docker build -t cart-service ./cart-service
docker run -d --name cart --network ecommerce-net -p 5002:5002 cart-service

docker build -t discount-service ./discount-service
docker run -d --name discount --network ecommerce-net -p 5003:5003 discount-service

docker build -t payment-service ./payment-service
docker run -d --name payment --network ecommerce-net -p 5004:5004 payment-service
```

### 6. Verify Everything is Running
```
docker ps
```

| Container | Port | Status |
|-----------|------|--------|
| mysql-db | 3306 | ✅ Up |
| rabbitmq | 5672, 15672 | ✅ Up |
| inventory | 5001 | ✅ Up |
| cart | 5002 | ✅ Up |
| discount | 5003 | ✅ Up |
| payment | 5004 | ✅ Up |

---

## 🧪 Testing the Checkout Flow

### Step 1 — Add Item to Cart
```
POST http://localhost:5002/cart
Body: { "product_id": 1, "quantity": 2 }
```

### Step 2 — Apply Discount Code
```
POST http://localhost:5003/discount
Body: { "code": "NEWYEAR", "original_price": 100000 }
```

### Step 3 — Process Payment
```
POST http://localhost:5004/payment
Body: { "product_id": 1, "quantity": 2, "discount_code": "NEWYEAR" }
```

### Step 4 — Verify Inventory Updated
```
GET http://localhost:5001/inventory/1
```

### Step 5 — Verify RabbitMQ Event
```
Open http://localhost:15672 → Login: guest / guest → Queues tab → payment_processed
```

---

## 🎟️ Available Discount Codes

| Code | Discount | Description |
|------|----------|-------------|
| NEWYEAR | 10% off | New Year offer |
| SAVE20 | 20% off | Save more offer |
| FLAT50 | 50% off | Flat half price |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| inventory | Stores product name, price, quantity |
| cart | Stores items added to cart |
| payments | Stores all transaction records |

---

## 🌐 Service Endpoints

| Service | Base URL |
|---------|----------|
| Inventory | http://localhost:5001 |
| Cart | http://localhost:5002 |
| Discount | http://localhost:5003 |
| Payment | http://localhost:5004 |
| RabbitMQ Dashboard | http://localhost:15672 |

---

## 📸 Screenshots

### 1. All Containers Running — Terminal
![Docker PS](screenshots/1.%20docker%20ps.png)

### 2. All Containers Running — Docker Desktop
![Docker GUI](screenshots/2.%20docker%20GUI.png)

### 3. Inventory List
![Inventory](screenshots/3.%20inventory.png)

### 4. Add Item to Cart
![Add to Cart](screenshots/4.%20add%20item%20to%20cart.png)

### 5. Apply Discount Code
![Apply Discount](screenshots/5.%20apply%20discount.png)

### 6. Process Payment
![Process Payment](screenshots/6.%20process%20payment.png)

### 7. Inventory Updated After Purchase
![Inventory Updated](screenshots/7.%20inventory%20update%20after%20purchase.png)

### 8. RabbitMQ Queue
![RabbitMQ](screenshots/8.%20RabbitMQ%20Queue.png)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

