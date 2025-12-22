const Task = require("../models/Task");
const axios = require("axios");

exports.addTask = async (req, res) => {
  const task = await Task.create(req.body);

  // Notify service
  await axios.post("http://notification-service:5000/notify", {
    message: `Task added: ${task.title}`
  });

  res.json(task);
};

exports.deleteTask = async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.send("Task Deleted");
};

exports.getTasks = async (req, res) => {
  res.json(await Task.find());
};
