import mongoose, { Connection } from 'mongoose';
mongoose.set('strictQuery', true);

interface ConnectionCache {
  [key: string]: Connection
}
const connectionCache: ConnectionCache = {};

export function connect(dbName: string) {
  const conn = mongoose.connections.find(c => c.name === dbName);
  const cachedConnection = connectionCache[dbName];

  if (conn) {
    console.log('👌 Reusing existing mongoose connection.', dbName);
    return conn;
  }

  if (cachedConnection) {
    console.log('👌 Reusing cached mongoose connection.', dbName);
    return cachedConnection;
  }

  const connection = mongoose.createConnection(process.env.MONGODB_URI || '', {
    autoIndex: true,
    dbName,
  });

  console.log('🔥 Creating new mongoose connection.', dbName);
  connectionCache[dbName] = connection;

  return connection;
}