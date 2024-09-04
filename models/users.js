const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  city: String,
  email: String,
  password: String,
  company: String,
});

module.exports = mongoose.model("users", userSchema);
