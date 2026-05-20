const mongoose = require("mongoose");

const StudyHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  flashcardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Flashcard",
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("StudyHistory", StudyHistorySchema);