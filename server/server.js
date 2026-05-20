const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

const authRoutes = require("./routes/auth");
const Flashcard = require("./models/Flashcard");
const User = require("./models/User");

const { authMiddleware, adminOnly } = require("./middleware/auth");

const StudyHistory = require("./models/StudyHistory");

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

app.get("/api/admin/history", authMiddleware, adminOnly, async (req, res) => {
  const history = await StudyHistory.find()
    .populate("userId", "username email")
    .populate("flashcardId", "question answer");

  res.json(history);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

app.put("/api/users/me", authMiddleware, async (req, res) => {
  try {
    const { username } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.userId,
      { username },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

app.delete("/api/users/me", authMiddleware, async (req, res) => {
  try {
    await Flashcard.deleteMany({ userId: req.user.userId });
    await User.findByIdAndDelete(req.user.userId);

    res.json({ message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

app.post("/api/history", authMiddleware, async (req, res) => {
  try {
    const card = await Flashcard.findById(req.body.flashcardId);

    const record = new StudyHistory({
      userId: req.user.userId,
      flashcardId: req.body.flashcardId,
      question: card?.question,
      answer: card?.answer
    });

    await record.save();

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: "History save failed" });
  }
});