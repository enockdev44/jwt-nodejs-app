const config = require("../config/auth.config");
const jwt = require("jsonwebtoken");
const { ObjectId } = require('mongodb');

var bcrypt = require("bcryptjs");


//* connect to database *//
const Database = require('../../app/config/database.config');

// Connection setup
const db = new Database(process.env.MONGO_URI, process.env.MONGO_DB);
db.connect();

// Model schema
const User = db.collection('users');
const Story = db.collection('stories');
const Role = db.collection('roles');


exports.allAccess = (req, res) => {
  res.status(200).json({message: "Public Content."});
};

exports.userBoard = (req, res) => {
  //console.log(req.userId)
  res.json({message: "User Content."});
};

exports.adminBoard = async (req, res) => {
  const stories = await Story.find().toArray()
  if (!stories) {
    res.status(404).json({message: "No Story Content."});
    return;
  }

  res.status(200).json({message: "Admin Content.", stories:stories});
  return;
};

exports.moderatorBoard = (req, res) => {
  res.json({message: "Moderator Content."});
};
