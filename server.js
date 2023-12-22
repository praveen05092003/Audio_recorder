const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 5001;

// Use multer.diskStorage to specify the disk storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use a timestamp for the filename
    const timestamp = Date.now();
    cb(null, `${timestamp}_recording.wav`);
  },
});

const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, "public")));

app.get("/upload/:filename", (req, res) => {
  console.log("GET : /upload/:filename ");
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found");
  }
});

// Handle POST requests to /upload for audio file
app.post("/upload", upload.single("audio"), (req, res) => {
  const audioFile = req.file;
  console.log("POST : /upload ");

  if (!audioFile) {
    return res.status(400).json({ error: "No audio file uploaded" });
  }

  // Respond with a success message
  res.json({ message: "Audio file received and saved successfully!" });
});

app.get("/recordings", (req, res) => {
  // send name of recording files , and then try downloading by clicking from frontend.
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
