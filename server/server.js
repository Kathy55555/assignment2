const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const authRoutes = require("./routes/auth");

// Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.static(path.join(__dirname, "../public"))); 
app.use("/api/auth", authRoutes);

// Connect to MongoDB (Mongoose 7+)
mongoose.connect("mongodb://127.0.0.1:27017/flashcards")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Import Flashcard model
const Flashcard = require("./models/Flashcard");

// CRUD ROUTES 

// CREATE
app.post("/api/flashcards", async (req, res) => {
  try {
    const card = new Flashcard(req.body);
    await card.save();
    res.json(card);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ
app.get("/api/flashcards", async (req, res) => {
  try {
    const cards = await Flashcard.find().sort({ createdAt: -1 });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
app.put("/api/flashcards/:id", async (req, res) => {
  try {
    const updated = await Flashcard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
app.delete("/api/flashcards/:id", async (req, res) => {
  try {
    await Flashcard.findByIdAndDelete(req.params.id);
    res.json({ message: "Flashcard deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Fallback route to serve index.html (SPA behavior)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});