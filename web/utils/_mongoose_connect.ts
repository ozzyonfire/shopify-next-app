import mongoose, { Connection } from 'mongoose';

interface ConnectionCache {
  [key: string]: Promise<Connection> | null;
}
const connectionCache: ConnectionCache = {};

export async function connect(dbName: string) {
  const conn = mongoose.connections.find(c => c.name === dbName);
  const cachedPromise = connectionCache[dbName];

  if (conn) {
    if (conn.readyState === 1) { // connected
      console.log('👌 Reusing existing mongoose connection.');
      return conn;
    } else if (cachedPromise) {
      await cachedPromise;
      return conn;
    }
  }

  const pendingConnection = mongoose.createConnection(process.env.MONGODB_URI || '', {
    autoIndex: true,
    dbName
  });

  connectionCache[dbName] = pendingConnection.asPromise();

  try {
    await connectionCache[dbName];
    console.log('🔥 Creating new mongoose connection.');
    return pendingConnection;
  } finally {
    connectionCache[dbName] = null;
  }
}