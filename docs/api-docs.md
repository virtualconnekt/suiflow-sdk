# API Documentation for Suiflow Project

## Overview
Suiflow provides a blockchain-based payment processing solution with a backend API, frontend checkout, and embeddable JS SDK. This documentation outlines the available API endpoints, their request/response formats, and usage examples.

## Base URL
The base URL for the API (local development):
```
http://localhost:4000/api
```

## Endpoints

### 1. Product Endpoints

#### Create Product
- **Endpoint:** `/products`
- **Method:** POST
- **Description:** Admin adds a new product.
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "priceInSui": 1000000000,
    "merchantAddress": "0x...",
    "redirectURL": "https://yourdomain.com/success" // optional
  }
  ```
- **Response:**
  - **Success (201):**
    ```json
    {
      "_id": "productId",
      "name": "...",
      "description": "...",
      "priceInSui": 1000000000,
      "merchantAddress": "0x...",
      "paymentLink": "http://localhost:5173/pay/productId",
      "redirectURL": "..."
    }
    ```

#### Get All Products
- **Endpoint:** `/products`
- **Method:** GET
- **Description:** List all products.
- **Response:** Array of product objects.

#### Get Product Details
- **Endpoint:** `/products/:id`
- **Method:** GET
- **Description:** Get details for a specific product.

---

### 2. Payment Endpoints

#### Create Payment Entry
- **Endpoint:** `/payments/create`
- **Method:** POST
- **Description:** Initiate a payment entry for a product.
- **Request Body:**
  ```json
  {
    "productId": "productId"
  }
  ```
- **Response:**
  - **Success (201):**
    ```json
    {
      "paymentLink": "http://localhost:5173/pay/productId",
      "paymentId": "..."
    }
    ```

#### Verify Payment (Auto-verify on-chain)
- **Endpoint:** `/payments/:id/verify`
- **Method:** POST
- **Description:** Backend checks the Sui blockchain for the transaction and marks payment as paid if confirmed.
- **Request Body:**
  ```json
  {
    "txnHash": "...",
    "customerWallet": "0x..."
  }
  ```
- **Response:**
  - **Success (200):**
    ```json
    {
      "message": "Payment verified",
      "payment": { ... }
    }
    ```
  - **Redirect:** If the product has a `redirectURL`, the backend will redirect to that URL with `?paymentId=...`.

#### List All Payments
- **Endpoint:** `/payments`
- **Method:** GET
- **Description:** List all payments (admin only).

---

### 3. Webhook Endpoint

#### Receive Webhook
- **Endpoint:** `/payments/webhook`
- **Method:** POST
- **Description:** Receives webhook notifications (e.g., payment success) for merchants.
- **Request Body:**
  ```json
  {
    "event": "payment.success",
    "amount": 1000000000,
    "txn": "...",
    "status": "paid",
    "reference": "...",
    "paidAt": "...",
    "createdAt": "..."
  }
  ```
- **Response:**
  - **Success (200):**
    ```json
    { "message": "Webhook received", "event": { ... } }
    ```

---

### 4. JS SDK (Pay Inline)

#### Usage
Include the SDK on your site:
```html
<script src="http://localhost:5173/sdk/suiflow.js"></script>
<script>
  Suiflow.init({
    productId: 'PRODUCT_ID',
    onSuccess: function(txHash) {
      alert('Payment successful! TxHash: ' + txHash);
    }
  });
</script>
```
- This will open a modal with the Suiflow checkout for the given product.
- On successful payment, `onSuccess` is called with the transaction hash.

---

## Usage Examples

### Example: Create Product
```bash
curl -X POST http://localhost:4000/api/products \
-H "Content-Type: application/json" \
-d '{
  "name": "Test Product",
  "description": "A great product",
  "priceInSui": 1000000000,
  "merchantAddress": "0x..."
}'
```

### Example: Create Payment Entry
```bash
curl -X POST http://localhost:4000/api/payments/create \
-H "Content-Type: application/json" \
-d '{ "productId": "PRODUCT_ID" }'
```

### Example: Verify Payment
```bash
curl -X POST http://localhost:4000/api/payments/PAYMENT_ID/verify \
-H "Content-Type: application/json" \
-d '{ "txnHash": "...", "customerWallet": "0x..." }'
```

---

## Conclusion
This API documentation provides a comprehensive guide to the endpoints available in the Suiflow project. For further assistance, please refer to the README.md file or contact the development team.