const express = require("express");

const app = express();
const PORT = 5000;

// Sample route
app.get("/", (req, res) => {
  res.send("Hello, Express with!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
