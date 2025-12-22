const express = require("express");
const app = express();

app.use(express.json());

app.post("/notify", (req, res) => {
  console.log("🔔 Notification:", req.body.message);
  res.send("Notification Sent");
});

app.listen(5000, () => console.log("Notification Service on 5000"));
