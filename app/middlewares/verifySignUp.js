//* connect to database *//
const Database = require('../../app/config/database.config');
const Model = require('../models');
const db = new Database(process.env.MONGO_URI, process.env.MONGO_DB);
db.connect();

const User = db.collection("users");

checkDuplicateUsernameOrEmail = async (req, res, next) => {

  const user = await db.collection("users").find(
  {
    username: req.body.username
  }).toArray();

  if (user.length>0) {
    //console.log(user)
    res.status(400).send({ message: "Failed! Username is already in use!" });
    return;
  }

  const email = await db.collection("users").find(
    { email: req.body.email }
    ).toArray();

  if (email.length>0) {
    //console.log(email)
    res.status(400).send({ message: "Failed! Email is already in use!" });
    return;
  }

  next();

  //* end connection to database *//

};

const verifySignUp = {
  checkDuplicateUsernameOrEmail
};

module.exports = verifySignUp;
