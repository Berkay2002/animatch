import { MongoClient } from 'mongodb';

// Disable the ESLint rule for this line
/* eslint-disable no-var */
declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}
/* eslint-enable no-var */