# Finora API Documentation

Base URL: `http://localhost:5000/api/v1`

## Authentication

All protected endpoints require: `Authorization: Bearer <access_token>`

### POST /auth/register
Register a new user account.

```json
{
  "fullName": "Jane Smith",
  "email": "jane@company.com",
  "password": "SecurePass123"
}
```

### POST /auth/login
```json
{
  "email": "jane@company.com",
  "password": "SecurePass123"
}
```

### POST /auth/refresh
```json
{
  "refreshToken": "<refresh_token>"
}
```

### POST /auth/forgot-password
```json
{
  "email": "jane@company.com"
}
```

### POST /auth/reset-password
```json
{
  "token": "<reset_token>",
  "password": "NewSecurePass123"
}
```

### POST /auth/logout
Requires authentication.

### GET /auth/profile
Requires authentication.

### PUT /auth/profile
```json
{
  "fullName": "Jane Smith",
  "currency": "USD",
  "theme": "dark",
  "emailNotifications": true,
  "budgetAlerts": true
}
```

### POST /auth/change-password
```json
{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass456"
}
```

---

## Transactions

### GET /transactions
Query params: `page`, `limit`, `sortBy`, `sortOrder`, `search`, `type`, `categoryId`, `startDate`, `endDate`, `minAmount`, `maxAmount`

### GET /transactions/:id
### POST /transactions
```json
{
  "amount": 150.00,
  "description": "Grocery shopping",
  "date": "2024-06-15T10:00:00Z",
  "type": "EXPENSE",
  "categoryId": "<category_id>",
  "notes": "Weekly groceries"
}
```

### PUT /transactions/:id
### DELETE /transactions/:id

---

## Categories

### GET /categories?type=EXPENSE
### GET /categories/:id
### POST /categories
```json
{
  "name": "Food",
  "type": "EXPENSE",
  "color": "#ef4444",
  "icon": "utensils"
}
```

### PUT /categories/:id
### DELETE /categories/:id

---

## Budgets

### GET /budgets?month=6&year=2024
### GET /budgets/:id
### POST /budgets
```json
{
  "amount": 500,
  "month": 6,
  "year": 2024,
  "categoryId": "<category_id>"
}
```

### PUT /budgets/:id
### DELETE /budgets/:id

---

## Dashboard

### GET /dashboard?month=6&year=2024

Returns: stats, recent transactions, charts data, budget status, financial health score.

---

## Reports

### GET /reports?type=monthly&month=6&year=2024&format=json
Types: `monthly`, `quarterly`, `yearly`, `category`, `cashflow`, `expense`, `income`
Formats: `json`, `pdf`, `excel`

---

## AI Assistant

### GET /ai/insights
### POST /ai/insights/generate
### GET /ai/spending-analysis
### GET /ai/financial-health
### GET /ai/forecast

---

## Notifications

### GET /notifications?unreadOnly=true
### GET /notifications/unread-count
### PATCH /notifications/:id/read
### PATCH /notifications/read-all
### DELETE /notifications/:id

---

## Response Format

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Error:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```
