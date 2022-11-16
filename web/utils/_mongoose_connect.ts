import mongoose, { Connection } from 'mongoose';

interface ConnectionCache {
  [key: string]: Connection
}
const connectionCache: ConnectionCache = {};

export function connect(dbName: string): Connection {
  if (connectionCache[dbName] === undefined) {
    const connection = mongoose.createConnection(process.env.MONGODB_URI || '', {
      autoIndex: true,
      dbName
    });
    connectionCache[dbName] = connection;
    return connection;
  }
  return connectionCache[dbName];
}