const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
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
