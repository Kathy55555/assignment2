const mongoose = require("mongoose");
const StudyHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  flashcardId: { type: mongoose.Schema.Types.ObjectId, ref: "Flashcard" },

  question: String,
  answer: String,

  completedAt: { type: Date, default: Date.now }
});