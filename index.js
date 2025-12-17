const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS configuration
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    "https://www.mywedsync.com",
    "https://mywedsync.com",
    "http://localhost:3000",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options("*", cors());

app.use(express.json());


// Health check route
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "wedsync-backend",
    time: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`WEDSYNC backend running on port ${PORT}`);
});
