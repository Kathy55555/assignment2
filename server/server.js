const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

const authRoutes = require("./routes/auth");
const Flashcard = require("./models/Flashcard");
const User = require("./models/User");

const { authMiddleware, adminOnly } = require("./middleware/auth");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/auth", authRoutes);

mongoose.connect("mongodb://127.0.0.1:27017/flashcards")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// CREATE
app.post("/api/flashcards", authMiddleware, async (req, res) => {
  const card = new Flashcard({
    userId: req.user.userId,
    question: req.body.question,
    answer: req.body.answer
  });

  await card.save();
  res.json(card);
});

// READ (only user’s cards)
app.get("/api/flashcards", authMiddleware, async (req, res) => {
  const search = req.query.search || "";

  const query = {
    userId: req.user.userId,
    $or: [
      { question: { $regex: search, $options: "i" } },
      { answer: { $regex: search, $options: "i" } }
    ]
  };

  const cards = await Flashcard.find(query);
  res.json(cards);
});

// UPDATE
app.put("/api/flashcards/:id", authMiddleware, async (req, res) => {
  const updated = await Flashcard.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    req.body,
    { new: true }
  );

  res.json(updated);
});

// DELETE
app.delete("/api/flashcards/:id", authMiddleware, async (req, res) => {
  await Flashcard.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.userId
  });

  res.json({ message: "Deleted" });
});

app.get("/api/admin/users", authMiddleware, adminOnly, async (req, res) => {
  const users = await User.find({}, "-password");
  res.json(users);
});

app.get("/api/admin/history", authMiddleware, adminOnly, async (req, res) => {
  const data = await Flashcard.find().populate("userId", "username email");
  res.json(data);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});