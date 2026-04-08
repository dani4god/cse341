const { MongoClient } = require('mongodb');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

let db;

const initDb = (callback) => {
  if (db) {
    console.log('Database is already initialized.');
    return callback(null, db);
  }

  MongoClient.connect(process.env.MONGODB_URI)
    .then((client) => {
      db = client.db();
      console.log('Connected to MongoDB successfully.');
      callback(null, db);
    })
    .catch((err) => {
      callback(err);
    });
};

const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDb first.');
  }
  return db;
};

module.exports = { initDb, getDb };