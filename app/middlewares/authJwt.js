const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
  const token = req.headers['authorization'].split(' ')[1];

  if (!req.body.token) {
    res.status(403).send({ message: "No token provided!" });
    return;
  }
  


  jwt.verify(token,
            config.secret,
            (err, decoded) => {
              if (err) {
                res.status(401).send({
                  message: "Unauthorized!",
                });

                return;
              }
              req.userId = decoded.id;
              req.roles = decoded.roles;
              next();
            });
};

isAdmin = (req, res, next) => {
  const roles = req.roles;
  //console.log(roles)
  if (roles == "ROLE_USER") {
    return res.status(401).send({
      message: "Unauthorized!",
    });
  }

  if (roles == "ROLE_MODERATOR") {
    return res.status(401).send({
      message: "Unauthorized!",
    });
  }
  next();

};

isModerator = (req, res, next) => {
  const roles = req.headers.roles;
  if (roles == "ROLE_USER") {
    return res.status(401).send({
      message: "Unauthorized!",
    });
  }
  next();

};

const authJwt = {
  verifyToken,
  isAdmin,
  isModerator,
};
module.exports = authJwt;
