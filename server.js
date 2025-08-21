const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");
const ClaimHistory = require("./models/ClaimHistory");
//taking from .env file
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
});

app.get("/", (req, res) => {
  res.send("User Points API is running");   });

app.get("/api/users", async (req, res) => {
  const users = await User.find().sort({ points: -1 });
  res.json(users);
});

app.post("/api/users", async (req, res) => {
  const { name } = req.body;
  try {
    const newUser = new User({ name });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: "User already exists or name invalid" });
  }
});

app.post("/api/claim/:userId", async (req, res) => {
  const { userId } = req.params;
  const randomPoints = Math.floor(Math.random() * 10) + 1;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.points += randomPoints;
  await user.save();
  await ClaimHistory.create({ userId: user._id, points: randomPoints });

  res.json({ user, claimedPoints: randomPoints });
});

app.get("/api/claims", async (req, res) => {
  const claims = await ClaimHistory.find()
    .populate("userId", "name")
    .sort({ claimedAt: -1 });
  res.json(claims);
});

app.listen(4000, () => console.log("API running on http://localhost:4000"));
