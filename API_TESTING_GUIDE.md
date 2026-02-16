# KGL API Testing Guide

**Base URL:** `http://localhost:3000/api`

---

## Author Information

**Name:** Simon Lodongo Taban  
**Email:** 
- simonlodongotaban@gmail.com
- simonlodongotaban@yahoo.com
- simonlodongotaban@outlook.com

**Phone:** 
- +256 (0) 789121378
- +256 (0) 788858064

---

## 🔐 AUTHENTICATION

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Manager",
  "email": "manager@kgl.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "manager",
  "branch": "branch1",
  "contact": "0712345678"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "role": "manager",
  "userId": "507f1f77bcf86cd799439011",
  "name": "John Manager"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "manager@kgl.com",
  "password": "password123"
}
```

Response includes: `token`, `role`, `userId`, `name`, `branch`, `contact`

### Get User Profile
```http
GET /auth/profile/:userId
```

---

## 📦 PROCUREMENT (Manager Only)

### Record Procurement
```http
POST /procurement
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Maize",
  "type": "Yellow Corn",
  "stock": 100,
  "cost": 5000,
  "dealerName": "Farm Supplies Ltd",
  "branch": "branch1",
  "contact": "0751234567",
  "salePrice": 6500
}
```

### Get All Produce
```http
GET /procurement
Authorization: Bearer {token}

# Optional query parameters:
?branch=branch1
```

### Get Produce by ID
```http
GET /procurement/:id
Authorization: Bearer {token}
```

### Update Produce
```http
PUT /procurement/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "stock": 85,
  "salePrice": 7000
}
```

### Out-of-Stock Alert
```http
GET /procurement/alerts/out-of-stock
Authorization: Bearer {token}

# Optional:
?branch=branch1
```

---

## 💰 SALES (Manager & Agent)

### Record Sale
```http
POST /sales
Authorization: Bearer {token}
Content-Type: application/json

{
  "produceName": "Maize",
  "tonnage": 15,
  "amountPaid": 97500,
  "buyerName": "Retail Supermarket",
  "branch": "branch1"
}
```

**Note:** System will automatically:
- Find the produce item
- Check if stock is available
- Reduce stock from produce
- Return remaining stock

### Get All Sales
```http
GET /sales
Authorization: Bearer {token}

# Optional filters:
?branch=branch1
?saleType=regular
```

### Get Sales by Agent
```http
GET /sales/agent/:agentId
Authorization: Bearer {token}

# Optional:
?branch=branch1
```

### Get Sale by ID
```http
GET /sales/:id
Authorization: Bearer {token}
```

---

## 📋 CREDIT SALES (Manager & Agent)

### Record Credit Sale
```http
POST /credit-sales
Authorization: Bearer {token}
Content-Type: application/json

{
  "buyerName": "Jane Smith Traders",
  "nin": "ABC123DEF456",
  "location": "Nairobi City",
  "contact": "0743456789",
  "amountDue": 150000,
  "produceName": "Beans",
  "tonnage": 20,
  "dueDate": "2026-03-16",
  "branch": "branch1"
}
```

**Note:** System will:
- Check stock availability
- Deduct from inventory
- Create credit record with status "pending"
- Track due dates

### Get All Credit Sales
```http
GET /credit-sales
Authorization: Bearer {token}

# Optional filters:
?branch=branch1
?status=pending    # pending, paid, overdue
```

### Get Credit Sales by Agent
```http
GET /credit-sales/agent/:agentId
Authorization: Bearer {token}

# Optional:
?branch=branch1
?status=pending
```

### Update Credit Sale Status
```http
PUT /credit-sales/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "paid"    # pending, paid, or overdue
}
```

### Overdue Credit Sales Alert
```http
GET /credit-sales/alerts/overdue
Authorization: Bearer {token}

# Optional:
?branch=branch1
```

---

## 📊 REPORTS

### Sales Summary (Director Only)
```http
GET /reports/sales-summary
Authorization: Bearer {token}

# Optional filters:
?branch=branch1
?startDate=2026-01-01
?endDate=2026-02-16
```

Response includes:
- Total regular sales
- Total credit sales
- Total revenue
- Pending credit sales
- Overdue credit sales
- Sales by branch breakdown
- Sales by agent breakdown

### Branch Report (Manager views their branch)
```http
GET /reports/branch-report
Authorization: Bearer {token}

# Optional:
?branch=branch1
?startDate=2026-01-01
?endDate=2026-02-16
```

### Inventory Report
```http
GET /reports/inventory
Authorization: Bearer {token}

# Optional:
?branch=branch1
```

Response includes:
- Out-of-stock items
- Low-stock items
- Inventory valuation

### Agent Performance Report
```http
GET /reports/agent-performance
Authorization: Bearer {token}

# Optional:
?branch=branch1
?startDate=2026-01-01
?endDate=2026-02-16
```

Response shows:
- Sales count per agent
- Total sales amount per agent
- Credit sales per agent
- Ranking by performance

---

## 🔄 Role-Based Access Summary

### Director (Admin)
- ✅ View all reports
- ✅ Record procurement
- ✅ Record sales (regular & credit)
- ✅ Access to all dashboards

### Manager
- ✅ Record procurement (own branch only)
- ✅ Record sales (own branch)
- ✅ View reports for own branch
- ✅ Update produce & prices
- ✅ View sales by agents in branch

### Agent (Sales)
- ✅ Record sales (regular & credit)
- ✅ View their own sales
- ✅ View their own credit sales
- ❌ Cannot record procurement
- ❌ Cannot view full reports

### Procurement
- ✅ Record procurement
- ❌ Cannot record sales
- ❌ Cannot access reports

---

## ⚠️ Common Errors & Solutions

### 401 - Unauthorized
**Cause:** No token or invalid token
**Solution:** Include `Authorization: Bearer {token}` header

### 403 - Forbidden
**Cause:** User role doesn't have permission
**Solution:** Ensure user has correct role for the action

### 400 - Validation Error
**Cause:** Invalid input data
**Solution:** Check field formats:
- Phone: 10-15 digits only
- Branch: "branch1" or "branch2"
- Status: "pending", "paid", or "overdue"
- Numeric fields: must be numbers > 0

### 404 - Not Found
**Cause:** Resource doesn't exist
**Solution:** Verify the ID or resource exists before trying to update

### Stock Error
**Cause:** Insufficient stock for sale
**Solution:** Check available stock first with GET /procurement

---

## 📝 Test Workflow Example

1. **Register Users**
   ```
   POST /auth/register (Manager)
   POST /auth/register (Agent)
   POST /auth/register (Director)
   ```

2. **Record Procurement** (as Manager)
   ```
   POST /procurement
   ```

3. **Make a Sale** (as Agent)
   ```
   POST /sales (stock auto-reduces)
   ```

4. **Make a Credit Sale** (as Agent)
   ```
   POST /credit-sales (stock auto-reduces)
   ```

5. **View Reports** (as Director)
   ```
   GET /reports/sales-summary
   GET /reports/inventory
   GET /reports/agent-performance
   ```

---

## 🛠️ Environment Setup

Add to `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/kgl
JWT_SECRET=your-secret-key-here
PORT=3000
```

---

## ✅ Status Check

To verify server is running:
```bash
curl http://localhost:3000/login
```

Should return the login page HTML.

---

**API is fully operational and ready for testing!** 🚀
