const express = require('express');

const { connectDB } = require('./config/connect');
const { log } = require('console');
const app = express();


const PORT = process.env.PORT;

async function startServer () {
  try {
    await connectDB();   
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
  } 
}

startServer();