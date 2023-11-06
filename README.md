# Zfunds API Documentation

Welcome to the Zfunds API documentation. This API allows advisors and users to interact with the Zfunds platform for financial product management. Below are the available endpoints and their usage.

#### Base URL: http://localhost:3000

#### Endpoints

#### 1. Advisor Signs Up

- URL: /advisor/signup
- Method: POST
- Description: Advisors can sign up using their mobile numbers.
- Request Body:
  - mobile (string): The mobile number of the advisor.
  - otp (string): A one-time password (random).
- Response:
  - advisorId (number): The unique identifier of the newly created advisor.
  - token (string): JWT token for authentication.

#### 2. Advisor Adds a Client

- URL: /advisor/add-client
- Method: POST
- Description: Advisors can add clients to their portfolio.
- Request Body:
  - name (string): The name of the client.
  - mobile (string): The mobile number of the client.
  - advisorId (number): The advisor's unique identifier.
- Response:
  - userId (number): The unique identifier of the newly created user.
  - name (string): The name of the client.
  - mobile (string): The mobile number of the client.
  - role (string): The role of the user (always "user").
  - advisorId (number): The advisor's unique identifier.

####3. Advisor Views a List of Clients

- URL: /advisor/clients
- Method: GET
- Description: Advisors can view a list of all their clients.
- Request Query Parameters:
  - advisorId (number): The advisor's unique identifier.
- Response:
  - An array of client objects with the following properties:
  - id (number): The unique identifier of the client.
  - name (string): The name of the client.
  - mobile (string): The mobile number of the client.

####4. User Signs Up

- URL: /user/signup
- Method: POST
- Description: Users can sign up using their mobile numbers.
- Request Body:
  - name (string): The name of the user.
  - mobile (string): The mobile number of the user.
  - otp (string): A one-time password (random).
- Response:
  - userId (number): The unique identifier of the newly created user.

#### 5. Admin Adds Products

- URL: /admin/add-product
- Method: POST
- Description: Admins can add financial products.
- Request Body:
  - name (string): The name of the product.
  - description (string): A description of the product.
  - category (string): The category of the product.
- Response:
  - productId (number): The unique identifier of the newly created product.
  - name (string): The name of the product.
  - category (string): The category of the product.

#### 6. Advisor Purchases Products for Users

- URL: /advisor/purchase-product
- Method: POST
- Description: Advisors can purchase products for their clients.
- Request Body:
  - advisorId (number): The advisor's unique identifier.
  - userId (number): The client's unique identifier.
  - productId (number): The product's unique identifier.
- Response:
  - productLink (string): A unique product link for the purchased product.
