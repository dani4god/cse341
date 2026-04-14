// This runs once after all tests
const { getDb } = require('../db/connect');

module.exports = async () => {
  console.log('Closing database connection...');
  const db = getDb();
  if (db) {
    await db.client.close();
  }
};