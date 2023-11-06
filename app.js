const express = require("express");
const { Pool } = require("pg");
const morgan = require("morgan");
const app = express();
const jwt = require("jsonwebtoken");
const port = 3000;

const pool = new Pool({
  user: "yash", //username
  host: "localhost", //host of psql
  database: "zfunds", //database name
  password: "12345@", //password entered
  port: 5432, //default portno
});

app.use(express.json());
app.use(morgan("dev")); //For logging request & response

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "An error occurred" });
});

async function executeQuery(query, params = []) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(query, params);
    await client.query("COMMIT");
    return rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// 1. Advisor signs up
app.post("/advisor/signup", async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;
    const role = "advisor";

    const userQuery =
      "INSERT INTO users (name, mobile, role) VALUES ($1, $2, $3) RETURNING id";
    const [{ id: advisorId }] = await executeQuery(userQuery, [
      "Advisor", // default name: Advisor
      mobile,
      role,
    ]);

    const token = jwt.sign({ id: advisorId, role }, "your_secret_key");

    res.json({ advisorId, token });
  } catch (error) {
    next(error);
  }
});

// 2. Advisor adds a client
app.post("/advisor/add-client", async (req, res, next) => {
  try {
    const { name, mobile, advisorId } = req.body;
    const role = "user";

    const userQuery =
      "INSERT INTO users (name, mobile, role, advisor_id) VALUES ($1, $2, $3, $4) RETURNING id";
    const [{ id: userId }] = await executeQuery(userQuery, [
      name,
      mobile,
      role,
      advisorId,
    ]);

    res.json({ userId, name, mobile, role, advisorId });
  } catch (error) {
    next(error);
  }
});
// 3. Advisor can view a list of all clients
app.get("/advisor/clients", async (req, res, next) => {
  try {
    const { advisorId } = req.query;

    const userQuery =
      "SELECT id, name, mobile FROM users WHERE advisor_id = $1 AND role = $2";
    const clients = await executeQuery(userQuery, [advisorId, "user"]);

    res.json(clients);
  } catch (error) {
    next(error);
  }
});
// 4. User signs up
app.post("/user/signup", async (req, res, next) => {
  try {
    const { name, mobile, otp } = req.body;
    const role = "user";

    const userQuery =
      "INSERT INTO users (name, mobile, role) VALUES ($1, $2, $3) RETURNING id";
    const [{ id: userId }] = await executeQuery(userQuery, [
      name,
      mobile,
      role,
    ]);

    res.json({ userId });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "Mobile number already exists" });
    }
    next(error);
  }
});
// 5. Admin adds products
app.post("/admin/add-product", async (req, res, next) => {
  try {
    const { name, description, category } = req.body;

    const categoryQuery =
      "INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id";
    const [{ id: categoryId }] = await executeQuery(categoryQuery, [category]);

    const productQuery =
      "INSERT INTO products (name, description, category_id) VALUES ($1, $2, $3) RETURNING id";
    const [{ id: productId }] = await executeQuery(productQuery, [
      name,
      description,
      categoryId,
    ]);

    res.json({ productId, name, category });
  } catch (error) {
    next(error);
  }
});
// 6. Advisor can purchase products for users
app.post("/advisor/purchase-product", async (req, res, next) => {
  try {
    const { advisorId, userId, productId } = req.body;
    const associationQuery = "SELECT 1 FROM users WHERE id = $1 AND id = $2";
    const associations = await executeQuery(associationQuery, [
      userId,
      advisorId,
    ]);

    if (associations.length === 0) {
      res
        .status(400)
        .json({ error: "Advisor is not associated with this user" });
      return;
    }

    // Creating unique product link
    const uniqueProductLink = generateUniqueProductLink();

    const purchaseQuery =
      "INSERT INTO purchases (advisor_id, user_id, product_id, product_link) VALUES ($1, $2, $3, $4) RETURNING id";
    const [{ id: purchaseId }] = await executeQuery(purchaseQuery, [
      advisorId,
      userId,
      productId,
      uniqueProductLink,
    ]);

    res.json({ productLink: uniqueProductLink });
  } catch (error) {
    next(error);
  }
});

function generateUniqueProductLink() {
  const timestamp = new Date().getTime();
  const uniqueId = Math.random().toString(36).substring(2, 15);
  return `https://zfunds/product/${timestamp}_${uniqueId}`;
}

app.listen(port, () => {
  console.log(`Zfunds app is running on http://localhost:${port}`);
});
