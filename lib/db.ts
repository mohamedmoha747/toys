import fs from "fs";
import path from "path";
import fallbackJson from "../data/db.json";
import type { DB } from "./types";

const file = path.join(process.cwd(), "data", "db.json");

export function readDb(): DB {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as DB;
  } catch {
    return structuredClone(fallbackJson) as DB;
  }
}

export function writeDb(db: DB) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(db, null, 2));
}
