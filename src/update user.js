import pool from "./db.js"; // file db.js yang sudah bikin Pool

async function updateUser(id) {
  try {
    const updatedAt = new Date(); // otomatis update updated_at
    const result = await pool.query(
      `UPDATE users
       SET nama = $1,
           email = $2,
           updated_at = $3
       WHERE id = $4
       RETURNING *`,
      ["user", "test@gmail.com", updatedAt, id]
    );

    console.log("User updated:", result.rows[0]);
  } catch (err) {
    console.error("Error updating user:", err);
  }
}

// Contoh update user dengan id 1
updateUser(1);
