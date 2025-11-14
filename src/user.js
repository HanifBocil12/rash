import pool from "./db.js";

async function seed() {
  const now = new Date();
  await pool.query(
    `INSERT INTO users (id, nama, password, email, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO NOTHING`,
    [1, "admin", "password123", "admin@example.com", now, now]
  );
  console.log("Seed complete");
}

seed().then(() => process.exit());