const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/users");

const jsonParser = bodyParser.json();

const jwtKey = "jwt";

const saltRounds = 10;

mongoose
  .connect(
    "mongodb+srv://Tanbits:5Ly980P6V7N6Q4pQ@cluster0.kz3mj.mongodb.net/tutorial"
  )
  .then(() => {
    console.log("mongodb connected");
  });

app.post("/register", jsonParser, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const data = new User({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      city: req.body.city,
      email: req.body.email,
      password: hashedPassword,
      company: req.body.company,
    });

    const result = await data.save();

    jwt.sign({ result }, jwtKey, { expiresIn: "300s" }, (error, token) => {
      if (error) {
        return res.status(500).json({ error: "Error generating token" });
      }
      res.status(201).json({ token });
    });
  } catch (error) {
    console.warn(error);
    res.status(500).json({ error: "Error registering user" });
  }
});

app.post("/login", jsonParser, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (isMatch) {
      jwt.sign({ user }, jwtKey, { expiresIn: "300s" }, (error, token) => {
        if (error) {
          return res.status(500).json({ error: "Error generating token" });
        }
        res.status(200).json({ message: "Login successful", token });
      });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  } catch (error) {
    console.warn(error);
    res.status(500).json({ error: "Error logging in" });
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
