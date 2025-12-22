require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();
app.use(express.json());

connectDB();
app.use("/auth", require("./routes/auth.routes"));

app.listen(4000, () => console.log("Auth Service running on 4000"));
