const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

const uploadFolder = path.join(__dirname, "transactions");
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/metrics", upload.array("files", 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  } else {
    return res.status(200).json({ message: "files uploaded" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello, Express with!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
