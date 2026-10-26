import express from 'express';
import { config } from './config.js';
import { pool, query } from './db.js';
import { minio, bucket, ensureBucket } from './storage.js';

const app = express();

// Parse JSON request bodies into req.body.
app.use(express.json());

// Reports whether Postgres and MinIO are reachable.
// Each check is isolated so one failure doesn't hide the other's status.
// Returns 200 when everything is ok, 503 otherwise.
app.get('/health', async (req, res) => {
  const checks = {};
  try {
    // Cheapest possible query: proves we can connect and run SQL.
    await query('SELECT 1');
    checks.postgres = 'ok';
  } catch (err) {
    checks.postgres = err.message;
  }
  try {
    // Proves MinIO is reachable and our credentials are valid.
    await minio.bucketExists(bucket);
    checks.minio = 'ok';
  } catch (err) {
    checks.minio = err.message;
  }
  const healthy = Object.values(checks).every((v) => v === 'ok');
  res.status(healthy ? 200 : 503).json(checks);
});

// Create the bucket before accepting traffic, so no request can hit a
// missing bucket. If MinIO is unreachable this throws and the process exits.
// (Top-level await works because package.json sets "type": "module".)
await ensureBucket();

const server = app.listen(config.port, () => {
  console.log(`Listening on port ${config.port}`);
});

// Graceful shutdown: stop accepting new connections, let in-flight requests
// finish, then close the Postgres pool. Without this, `docker compose down`
// waits 10s and SIGKILLs the container mid-request.
// SIGTERM comes from Docker; SIGINT from Ctrl+C.
const shutdown = () => {
  server.close(() => pool.end().then(() => process.exit(0)));
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
