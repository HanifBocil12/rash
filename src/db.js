import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:aDPqkyMltnYJiJSwKHVoSltNnRIPUrqJ@postgres.railway.internal:5432/railway",
  ssl: {
    rejectUnauthorized: false, // penting untuk Railway
  },
});

export default pool;
