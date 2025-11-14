import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:aDPqkyMltnYJiJSwKHVoSltNnRIPUrqJ@centerbeam.proxy.rlwy.net:49775/railway",
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
