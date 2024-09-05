const express = require("express");
const app = express();
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
const crypto = require("crypto");
const User = require("./models/users");

// json web token

const jwt = require('jsonwebtoken')
jwtKey = 'jwt'

const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16); 

mongoose
  .connect(
    "mongodb+srv://Tanbits:5Ly980P6V7N6Q4pQ@cluster0.kz3mj.mongodb.net/tutorial"
  )
  .then(() => {
    console.log("mongodb connected");
  });

// post user api
app.post("/register", jsonParser, function (req, res) {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(req.body.password, "utf8", "hex");
  encrypted += cipher.final("hex");

  console.log("Encrypted Password: ", encrypted);

  const data = new User({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    city: req.body.city,
    email: req.body.email,
    password: encrypted,
    company: req.body.company,
  });

  data
    .save()
    .then((result) => {
      jwt.sign({result},jwtKey,{expiresIn:'300s'},(error,token)=>{
        res.status(201).json({token})
      })
      // res.status(201).json(result);
    })
    .catch((error) => console.warn(error));

  // res.end("User registered successfully with encrypted password");
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
