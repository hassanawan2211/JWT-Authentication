const express = require("express");

const app = express();

const mongoose = require("mongoose");

const User = require('./models/users')

mongoose.connect(
  "mongodb+srv://Tanbits:5Ly980P6V7N6Q4pQ@cluster0.kz3mj.mongodb.net/tutorial"
)
.then(()=>{
    console.log('mongodb connect')
})

app.get("/", function (req, res) {
  res.send("helo");
});

app.listen(4000);
