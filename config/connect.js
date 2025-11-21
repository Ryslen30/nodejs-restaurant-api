const { log } = require('console');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const dbURI = process.env.DB_URI;

function connectDB() {
  try {
    mongoose.connect(dbURI);
    log('MongoDB connection successful'); 
  } catch(err){
    console.error('Failed to connect to MongoDB' , err);
  }
}

module.exports = { connectDB }; 