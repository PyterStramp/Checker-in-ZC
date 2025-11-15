//Postgres

import { Pool } from 'pg';

const globalForPg = global;

let pool;

if (!globalForPg.pool) {
  globalForPg.pool = new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

pool = globalForPg.pool;

export default pool;