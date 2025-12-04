const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const { connectDB } = require('./config/connect');
const app = express();
const methodOverride = require('method-override');

// 1. Body Parser / URL Encoded for form data (required for method-override to see the hidden input)
app.use(express.urlencoded({ extended: true }));

// 2. The method-override middleware MUST run after the body parser and before the router.
// It checks for the query parameter '_method' or the hidden form field.
app.use(methodOverride('_method'));


// This must run before your routes and your authentication middleware.
app.use(cookieParser());

// Import your routes
const routes = require('./app/routes/routes');

const PORT = process.env.PORT;

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'app', 'views')); // Adjust path if needed

// Essential middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Mount your routes under /api
app.use('/api', routes);

async function startServer() {
  try {
    await connectDB(); 
  
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  } 
}

startServer();