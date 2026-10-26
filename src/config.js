const env = (name, fallback) => {
  const value = process.env[name] ?? fallback;
  if (value === undefined) throw new Error(`Missing required env var: ${name}`);
  return value;
};

export const config = {
  port: Number(env('PORT', 3000)),
  databaseUrl: env('DATABASE_URL'),
  minio: {
    endPoint: env('MINIO_ENDPOINT', 'localhost'),
    port: Number(env('MINIO_PORT', 9000)),
    useSSL: env('MINIO_USE_SSL', 'false') === 'true',
    accessKey: env('MINIO_ACCESS_KEY'),
    secretKey: env('MINIO_SECRET_KEY'),
    bucket: env('MINIO_BUCKET', 'streamer'),
  },
};
