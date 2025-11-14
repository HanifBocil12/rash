import pool from "./db.js";
import bcrypt from "bcryptjs";

async function seed() {
  try {
    const now = new Date();

    // 1️⃣ Hash password
    const plainPassword = "password123";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    // 2️⃣ Insert data initial dengan password sudah di-hash
    const result = await pool.query(
      `INSERT INTO users (id, nama, password, email, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING
       RETURNING id, nama, password, email, created_at, updated_at`,
      [1, "admin", hashedPassword, "admin@example.com", now, now]
    );

    if (result.rowCount === 0) {
      console.log("User already exists, seed skipped");
    } else {
      console.log("Seed complete:", result.rows[0]);
    }
  } catch (err) {
    console.error("Error seeding user:", err);
  } finally {
    await pool.end();
  }
}

seed();
