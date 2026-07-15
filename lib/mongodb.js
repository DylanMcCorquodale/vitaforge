import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB || "vitaforge";

let clientPromise;
let indexesPromise;

function connection() {
  if (!uri) throw new Error("MONGODB_URI is not configured.");
  if (!clientPromise) {
    const client = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 10000 });
    clientPromise = client.connect();
  }
  return clientPromise;
}

async function ensureIndexes(db) {
  if (!indexesPromise) {
    indexesPromise = Promise.all([
      db.collection("users").createIndex({ email: 1 }, { unique: true, name: "users_email_unique" }),
      db.collection("sessions").createIndex({ tokenHash: 1 }, { unique: true, name: "sessions_token_unique" }),
      db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "sessions_expiry_ttl" }),
      db.collection("sessions").createIndex({ userId: 1 }, { name: "sessions_user" }),
      db.collection("dailyLogs").createIndex({ userId: 1, date: 1 }, { unique: true, name: "daily_logs_user_date_unique" }),
      db.collection("dailyLogs").createIndex({ userId: 1, date: -1 }, { name: "daily_logs_user_date" })
    ]).catch((error) => {
      indexesPromise = undefined;
      throw error;
    });
  }
  await indexesPromise;
}

export async function getDatabase() {
  const client = await connection();
  const db = client.db(databaseName);
  await ensureIndexes(db);
  return db;
}

export async function closeDatabaseForTests() {
  if (clientPromise) await (await clientPromise).close();
  clientPromise = undefined;
  indexesPromise = undefined;
}
