# CoreTech ERP Backend

Node.js + Express API for the CoreTech React Native ERP app. MongoDB Atlas is used for persistence. The mobile app is unchanged and remains a separate project.

## Run locally

1. Copy `.env.example` to `.env` if needed. This repo already reads `CT_backend/.env`.
2. Do **not** commit `.env` or `atlas-credentials.env`.
3. Install and start:

```bash
cd CT_backend
npm install
npm start
```

The API listens on `http://localhost:5000`.

Health check:

```bash
curl http://localhost:5000/api/health
```

Base prefixes: `/api` and `/api/v1` (same router).

## Auth

Protected routes require:

```
Authorization: Bearer <accessToken>
```

Register creates a business (tenant) and an **admin** owner. All subsequent records are scoped to that business.

Roles: `admin`, `manager`, `staff`, `accountant`.

## Verification

```bash
npm run verify
```

This script registers a user, then exercises CRUD, auth, sales/purchase stock updates, and dashboard totals against MongoDB.

## API modules

Responses use:

```json
{ "success": true, "message": "OK", "data": {} }
```

List endpoints also include `total`, `page`, and `limit`.

### Health
- `GET /api/health`

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `POST /api/auth/change-password`
- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-otp`
- `POST /api/auth/reset-password`

Login example:

```json
POST /api/auth/login
{ "email": "owner@example.com", "password": "Password1!" }

{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "...", "email": "...", "role": "Admin" },
    "tokens": { "accessToken": "...", "refreshToken": "..." }
  }
}
```

### Users and roles
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users` (admin)
- `PUT /api/users/:id` (admin)
- `DELETE /api/users/:id` (admin)

### Business
- `GET /api/businesses/current`
- `PUT /api/businesses/current` (admin)

### Dashboard
- `GET /api/dashboard/summary`
- `GET /api/dashboard/activities`

Summary `salesAmount` / counts are aggregated from MongoDB sales, purchases, products, and customers.

### Products and categories
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/products/categories`
- `GET /api/products/units`
- `GET|POST|PUT|DELETE /api/categories`

### Inventory
- `GET /api/inventory/movements`
- `POST /api/inventory/adjust` `{ "productId", "direction": "in|out", "quantity", "note" }`

### Sales / transactions
- `GET /api/sales`
- `GET /api/sales/:id`
- `POST /api/sales`
- `PUT /api/sales/:id` (payment status)
- `DELETE /api/sales/:id` (restores stock)
- `GET /api/transactions` (same as sales list)

Creating a sale decrements product stock inside a MongoDB transaction.

### Purchases
- `GET /api/purchases`
- `GET /api/purchases/:id`
- `POST /api/purchases`
- `POST /api/purchases/:id/receive`
- `DELETE /api/purchases/:id` (reverses stock if received)

Default create status is `received`, which increments stock.

### Customers / suppliers
- CRUD under `/api/customers` and `/api/suppliers`

### Notifications
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `POST /api/notifications/read-all`

### Reports
- `GET /api/reports/sales`
- `GET /api/reports/purchases`
- `GET /api/reports/inventory`

Query: `from`, `to` ISO dates.

### Settings
- `GET /api/settings`
- `PUT /api/settings`

## Query params

Most lists accept `search`, `page`, `limit`, `sortBy`, `sort=asc|desc`.

## Atlas connectivity

The server **does not listen** until MongoDB connects. If Atlas returns a server-selection / IP whitelist error, add this computer’s public IP under Atlas **Network Access**. Do not paste the connection string into issues, README, or chat.

After Atlas allows the IP:

```bash
cd CT_backend
npm start
npm run verify
```

`npm run verify` registers a disposable tenant, then checks auth, CRUD, sale stock-out, purchase stock-in, and dashboard totals vs MongoDB.

```bash
npm test
```

Security notes: JWT is HS256; auth routes are rate-limited separately; `PUT /products` does not change stock (use `/inventory/adjust`); sale totals are computed on the server; forgot-password never returns the OTP in JSON.

## Example requests and responses

All authenticated calls:

```
Authorization: Bearer <accessToken>
```

### Health

`GET /api/health`

```json
{ "success": true, "message": "Healthy", "data": { "status": "ok", "service": "ct-backend" } }
```

### Register

`POST /api/auth/register`

```json
{ "name": "Owner", "email": "owner@example.com", "phone": "03001234567", "company": "Acme Traders", "password": "Password1!" }
```

```json
{
  "success": true,
  "message": "Account created",
  "data": {
    "user": { "id": "...", "name": "Owner", "email": "owner@example.com", "role": "admin" },
    "tokens": { "accessToken": "...", "refreshToken": "..." }
  }
}
```

### Login / me / refresh / logout

`POST /api/auth/login` `{ "email", "password" }` → same `user` + `tokens` shape.

`GET /api/auth/me` → user document (`id`, `name`, `email`, `role`, `businessId`, …).

`POST /api/auth/refresh` `{ "refreshToken" }` → new `tokens`.

`POST /api/auth/logout` `{ "refreshToken" }` → `{ "success": true, "data": null }`.

### Users

`POST /api/users` (admin)

```json
{ "name": "Ayesha", "email": "staff@example.com", "password": "Password1!", "role": "staff" }
```

`GET /api/users?search=ayesha&page=1&limit=20`

```json
{ "success": true, "data": [{ "id": "...", "name": "Ayesha", "role": "staff" }], "total": 1, "page": 1, "limit": 20 }
```

### Business

`GET /api/businesses/current` → tenant company record.

`PUT /api/businesses/current` `{ "name": "Acme Traders", "phone": "0300..." }` (admin).

### Products / categories

`POST /api/products`

```json
{
  "name": "USB Cable",
  "sku": "USB-001",
  "category": "Electronics",
  "unit": "Piece",
  "price": 1200,
  "costPrice": 700,
  "stockQuantity": 10,
  "lowStockThreshold": 2
}
```

`GET /api/products/categories` and `GET /api/products/units` (`Piece`, `Kg`, `Liter`, `Box`, `Pack`, `Dozen`).

### Customers / suppliers

`POST /api/customers` `{ "name": "Ali Hassan", "email": "ali@mail.test", "phone": "03001112222", "company": "AH Traders" }`

`POST /api/suppliers` `{ "name": "Tech Dist", "email": "sup@mail.test", "phone": "03003334444", "company": "TD" }`

### Sales (decrements stock)

`POST /api/sales`

```json
{
  "customerId": "<id>",
  "items": [{ "productId": "<id>", "quantity": 2, "price": 1200, "discount": 0, "tax": 0 }],
  "discount": 0,
  "tax": 0,
  "paymentStatus": "paid"
}
```

```json
{
  "success": true,
  "data": {
    "id": "...",
    "invoiceNumber": "INV-2026-0001",
    "totalAmount": 2400,
    "paymentStatus": "paid",
    "items": [{ "productName": "USB Cable", "quantity": 2, "total": 2400 }]
  }
}
```

Deleting a sale restores stock. `GET /api/transactions` lists the same records as `GET /api/sales`.

### Purchases (increments stock when received)

`POST /api/purchases`

```json
{
  "supplierId": "<id>",
  "items": [{ "productId": "<id>", "quantity": 5, "purchasePrice": 700 }],
  "status": "received"
}
```

Pending: `"status": "pending"` then `POST /api/purchases/:id/receive` or `PUT /api/purchases/:id` with `{ "status": "received" }`.

### Inventory

`GET /api/inventory/movements?productId=<id>`

`POST /api/inventory/adjust` `{ "productId": "<id>", "direction": "in", "quantity": 3, "note": "Count correction" }`

### Dashboard

`GET /api/dashboard/summary`

```json
{
  "success": true,
  "data": {
    "totalProducts": 1,
    "totalSales": 1,
    "totalPurchases": 1,
    "totalCustomers": 1,
    "lowStockCount": 0,
    "salesAmount": 2400,
    "purchasesAmount": 3500
  }
}
```

Counts and amounts are MongoDB aggregations, not mocks.

### Notifications / reports / settings

`GET /api/notifications`

`PATCH /api/notifications/:id/read` (also `PUT`)

`POST /api/notifications/read-all`

`GET /api/reports/sales?from=2026-01-01&to=2026-12-31`

`GET /api/reports/purchases`

`GET /api/reports/inventory`

`GET /api/settings`

`PUT /api/settings` `{ "currency": "PKR", "taxRate": 0 }`

## AI

Prophet, Isolation Forest, and Apriori are **not implemented**. See `future/ai/README.md`. No fake AI endpoints.

## React Native

This folder is independent of the mobile app. Point `API_CONFIG.BASE_URL` at `http://<lan-ip>:5000/api` (or `/api/v1`) when you switch off mock mode. Do not commit `.env`.
