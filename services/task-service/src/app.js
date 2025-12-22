require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);
app.use("/tasks", require("./routes/task.routes"));

app.listen(4001, () => console.log("Task Service running on 4001"));
