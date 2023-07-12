// Imports the Express.js framework
const express = require('express');

// Creates an instance of the Express application.
const app = express();

// Enable Cross-Origin Resource Sharing (CORS) headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET'); // Allow only GET requests
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow only Content-Type header
  next();
});

// Serve the PDF file from the public directory
app.use(express.static('public'));

// Start the server
app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
