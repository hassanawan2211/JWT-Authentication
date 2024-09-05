const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/users");

const jsonParser = bodyParser.json();

const jwtKey = "jwt"; // Secret key for JWT
const saltRounds = 10; // Salt rounds for bcrypt

mongoose
  .connect(
    "mongodb+srv://Tanbits:5Ly980P6V7N6Q4pQ@cluster0.kz3mj.mongodb.net/tutorial"
  )
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Register route
app.post("/register", jsonParser, async (req, res) => {
  try {
    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    // Create a new user
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      city: req.body.city,
      email: req.body.email,
      password: hashedPassword,
      company: req.body.company,
    });

    // Save the user in the database
    const result = await user.save();

    // Generate a JWT token
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

// Login route
app.post("/login", jsonParser, async (req, res) => {
  try {
    // Find the user by email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Compare the password with the hashed password
    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (isMatch) {
      // Generate a JWT token on successful login
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

// Get all users (protected route)
app.get("/users", verifyToken, function (req, res) {
  User.find()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      res.status(500).json({ error: "Error fetching users" });
    });
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];

    jwt.verify(token, jwtKey, (err, authData) => {
      if (err) {
        res.status(403).json({ error: "Invalid token" });
      } else {
        req.authData = authData; // Optionally pass the authenticated data forward
        next();
      }
    });
  } else {
    res.status(403).json({ error: "Token not found" });
  }
}

// Start the server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
