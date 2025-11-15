//Postgres

import { Pool } from 'pg';

const globalForPg = global;

let pool;

if (!globalForPg.pool) {
  globalForPg.pool = new Pool({
    connectionString: process.env.DB_URI,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

pool = globalForPg.pool;

export default pool;