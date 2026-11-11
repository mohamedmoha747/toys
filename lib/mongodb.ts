import mongoose from "mongoose";
import { ensureSeed } from "./seed";

type MongoCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  seeded: boolean;
  seeding: Promise<void> | null;
};

const globalCache = globalThis as unknown as { limeeMongo?: MongoCache };

function cache(): MongoCache {
  if (!globalCache.limeeMongo) {
    globalCache.limeeMongo = { conn: null, promise: null, seeded: false, seeding: null };
  }
  return globalCache.limeeMongo;
}

async function seedOnce() {
  const box = cache();
  if (box.seeded) return;
  if (!box.seeding) {
    box.seeding = ensureSeed()
      .then(() => {
        box.seeded = true;
      })
      .catch((error: unknown) => {
        box.seeding = null;
        throw error;
      });
  }
  await box.seeding;
}

export async function connectDb() {
  const box = cache();
  if (box.conn && mongoose.connection.readyState !== 1) {
    box.conn = null;
    box.promise = null;
  }
  if (!box.conn) {
    if (!box.promise) {
      const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/limee-toys";
      const source = process.env.MONGODB_URI ? "MONGODB_URI" : "local default";
      box.promise = mongoose
        .connect(uri, {
          serverSelectionTimeoutMS: 8000,
          family: 4,
        })
        .then((connected) => {
          const { host, name } = connected.connection;
          console.log(`MongoDB connected (${source}): ${host} / database "${name}"`);
          return connected;
        })
        .catch((error: unknown) => {
          box.promise = null;
          const message = error instanceof Error ? error.message : "unknown error";
          console.error(`MongoDB connection failed (${source}): ${message}`);
          console.error("Atlas: Network Access must allow this machine. On a host such as Vercel, allow 0.0.0.0/0.");
          throw error;
        });
    }
    box.conn = await box.promise;
  }
  await seedOnce();
  return box.conn;
}
