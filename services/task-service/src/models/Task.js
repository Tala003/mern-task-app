const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: String,
  userId: String
});

module.exports = mongoose.model("Task", TaskSchema);
