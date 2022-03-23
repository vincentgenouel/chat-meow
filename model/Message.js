const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const messageSchema = mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  user: {
    type: String,
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
});

// userSchema.set("timestamps", true);

module.exports = mongoose.model("message", messageSchema);
