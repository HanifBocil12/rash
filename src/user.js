import pool from "./db.js";

async function seed() {
  try {
    const now = new Date();

    // 1️⃣ Ubah semua kolom ke VARCHAR/TEXT supaya bisa menampung string panjang
    await pool.query(`
      ALTER TABLE users
      ALTER COLUMN nama TYPE VARCHAR(255),
      ALTER COLUMN password TYPE VARCHAR(255),
      ALTER COLUMN email TYPE VARCHAR(255)
    `);

    // 2️⃣ Insert data initial
    const result = await pool.query(
      `INSERT INTO users (id, nama, password, email, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING
       RETURNING id, nama, password, email, created_at, updated_at`,
      [1, "admin", "password123", "admin@example.com", now, now]
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
