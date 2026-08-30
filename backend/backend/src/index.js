require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

// const apiRoutes = require('./routes/api');
const apiRoutes = require("./routes/index")

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
// Import Main API Router
// const apiRoutes = require('./routes/api');
// const apiv2Routes = require('./routes/api_v2')

// Initialize Express App
const app = express();

const startCronJobs = require('./services/cronService');
// Connect to MongoDB
connectDB();

startCronJobs();

// Additional allowed origins for deployed frontends, e.g.
// ALLOWED_ORIGINS=http://my-bucket.s3-website.ap-south-1.amazonaws.com,https://my-domain.com
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// PayU (and any other payment gateway) redirects the browser back to these
// two routes via a cross-origin form POST from its own domain - that Origin
// will never be in our allowlist, and unlike a same-page fetch/XHR this is a
// full top-level navigation, so blocking it just shows the visitor a raw
// JSON error instead of letting paymentSuccess's res.redirect(...) run.
const corsExemptPaths = [
  '/api/v1/subscription/payment-success',
  '/api/v1/subscription/payment-failure',
];

// Global Middlewares
app.use(cors(function (req, callback) {
  if (corsExemptPaths.includes(req.path)) {
    return callback(null, { origin: true, credentials: true });
  }

  const origin = req.headers.origin;
  console.log("Origin:", origin);

  if (!origin || origin === "null") {
    return callback(null, { origin: true, credentials: true });
  }
  // Allow any localhost origin for development
  if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
    return callback(null, { origin: true, credentials: true });
  }
  if (allowedOrigins.includes(origin)) {
    return callback(null, { origin: true, credentials: true });
  }
  return callback(new Error('Not allowed by CORS'));
})); // Allow requests from React Web and React Native Mobile
app.use(express.json({ limit: "50mb" })); // Parse incoming JSON payloads up to 50mb
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Mount Routes
app.use('/api/v1', apiRoutes); // single address for all api -> inside apiRoutes we will match the respective routes and connect further to its own respective routes file


// Health Check Route (Useful for AWS/Deployment checks)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Platform is online and running.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
}); 
