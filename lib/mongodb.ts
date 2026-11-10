import mongoose from "mongoose";
import { ensureSeed } from "./seed";

const globalCache = globalThis as unknown as {
  limeeMongo?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

if (!globalCache.limeeMongo) globalCache.limeeMongo = { conn: null, promise: null };

export async function connectDb() {
  const cache = globalCache.limeeMongo!;
  if (!cache.conn) {
    if (!cache.promise) {
      const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/limee-toys";
      cache.promise = mongoose.connect(uri);
    }
    cache.conn = await cache.promise;
  }
  await ensureSeed();
  return cache.conn;
}
