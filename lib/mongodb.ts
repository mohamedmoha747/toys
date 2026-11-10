import mongoose from "mongoose";
import { ensureSeed } from "./seed";

const globalCache = globalThis as unknown as {
  limeeMongo?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

if (!globalCache.limeeMongo) globalCache.limeeMongo = { conn: null, promise: null };

export async function connectDb() {
  const cache = globalCache.limeeMongo!;
  if (cache.conn && mongoose.connection.readyState !== 1) {
    cache.conn = null;
    cache.promise = null;
  }
  if (!cache.conn) {
    if (!cache.promise) {
      const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/limee-toys";
      const source = process.env.MONGODB_URI ? "MONGODB_URI" : "local default";
      cache.promise = mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
        family: 4,
      }).then((connected) => {
        const { host, name } = connected.connection;
        console.log(`MongoDB connected (${source}): ${host} / database "${name}"`);
        return connected;
      }).catch((error: unknown) => {
        cache.promise = null;
        const message = error instanceof Error ? error.message : "unknown error";
        console.error(`MongoDB connection failed (${source}): ${message}`);
        console.error("Atlas: Network Access must allow this machine. On a host such as Vercel, allow 0.0.0.0/0.");
        throw error;
      });
    }
    cache.conn = await cache.promise;
  }
  await ensureSeed();
  return cache.conn;
}
