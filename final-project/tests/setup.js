// This runs once before all tests
const { initDb } = require('../db/connect');

module.exports = async () => {
  console.log('Setting up test environment...');
  
  return new Promise((resolve, reject) => {
    initDb((err) => {
      if (err) {
        console.error('Database connection error:', err);
        reject(err);
      } else {
        console.log('Test database connected successfully');
        resolve();
      }
    });
  });
};