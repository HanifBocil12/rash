import pool from "./db.js";

async function updateUser(id) {
  try {
    const updatedAt = new Date();

    // Cek dulu apakah user ada
    const check = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);

    if (check.rowCount === 0) {
      // Kalau tidak ada, insert user baru
      const createdAt = new Date();
      const insert = await pool.query(
        `INSERT INTO users (id, nama, password, email, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, nama, password, email, created_at, updated_at`,
        [id, "user", "password123", "test@gmail.com", createdAt, updatedAt]
      );
      console.log("User inserted:", insert.rows[0]);
    } else {
      // Kalau ada, update user
      const result = await pool.query(
        `UPDATE users
         SET nama = $1,
             email = $2,
             updated_at = $3
         WHERE id = $4
         RETURNING id, nama, password, email, created_at, updated_at`,
        ["user", "test@gmail.com", updatedAt, id]
      );
      console.log("User updated:", result.rows[0]);
    }
  } catch (err) {
    console.error("Error updating/inserting user:", err);
  }
}

// Contoh update atau insert user dengan id 1
updateUser(1);
