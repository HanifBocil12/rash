import pool from "./db.js";

async function updateUser(id) {
  try {
    const updatedAt = new Date();
    const result = await pool.query(
      `UPDATE users
       SET nama = $1,
           email = $2,
           updated_at = $3
       WHERE id = $4
       RETURNING id, nama, password, email, created_at, updated_at`,
      ["user", "test@gmail.com", updatedAt, id]
    );

    if (result.rowCount === 0) {
      console.log("No user found with id", id);
    } else {
      console.log("User updated:", result.rows[0]);
    }
  } catch (err) {
    console.error("Error updating user:", err);
  }
}

// Contoh update user dengan id 1
updateUser(1);
