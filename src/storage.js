import * as Minio from 'minio';
import { config } from './config.js';

const { bucket, ...clientOptions } = config.minio;

export const minio = new Minio.Client(clientOptions);
export { bucket };

export async function ensureBucket() {
  if (!(await minio.bucketExists(bucket))) {
    await minio.makeBucket(bucket);
    console.log(`Created bucket "${bucket}"`);
  }
}
