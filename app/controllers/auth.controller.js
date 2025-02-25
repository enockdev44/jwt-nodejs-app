const config = require("../config/auth.config");
const jwt = require("jsonwebtoken");
const { ObjectId } = require('mongodb');

/*const db = require("../models");
const User = db.user;
const Role = db.role;*/

var bcrypt = require("bcryptjs");


//* connect to database *//
const Database = require('../../app/config/database.config');
//const Model = require('../../model');
// Connection setup
const db = new Database(process.env.MONGO_URI, process.env.MONGO_DB);
db.connect();
const User = db.collection('users');
const Story = db.collection('stories');
const Role = db.collection('roles');

//db.close();

exports.signup = async (req, res) => {
    if(!req.body.username) {
      res.status(404).send({message:"username is required"})
      return
    }
    if(!req.body.email) {
      res.status(404).send({message:"email is required"})
      return
    }
    if(!req.body.password) {
      res.status(404).send({message:"password is required"})
      return
    }

    if (req.body.username) {
      // danger to delete multiple users //
      //User.deleteMany({});
      if (req.body.email) {
        if (req.body.password) {
          const query = req.body.username != "superuser" ? { "name": "user" } : {};
          //const defaultRole = await Role.find({}).toArray() // all roles that includes admin, moderator and user
          const defaultRole = await Role.find(query).toArray() // only user role
          //const defaultRole = await Role.find({ "name" : { $exists: true, $ne : "admin" }}).toArray() // not admin but twice roles that includes moderator and user
          if(defaultRole){
            // console.log(defaultRole)
            const user = {
                username: req.body.username, //string
                email: req.body.email, //string
                password: bcrypt.hashSync(req.body.password, 8), //string
                roles: defaultRole, //array
                createdAt: new Date()
            }

            const result = await User.insertOne(user)

            //console.log(result)
            
            if (!result) {
              res.json({message: "Error occured"})
              return
            }
            
            res.json({message: "Sign Up Successfully"})
            return

          }

        }
      }
    }

    //* end connection to database *//

};

exports.signin = async (req, res) => {
    if(!req.body.username) {
      res.status(404).send({message:"username is required"})
    }

    if(!req.body.password) {
      res.status(404).send({message:"password is required"})
    }
      if (req.body.username) {
        if (req.body.password) {
           const user = await User.findOne({
                username: req.body.username,
              })
           /*.aggregate([
              { $lookup:
                {
                  from: 'roles',
                  localField: 'roles',
                  foreignField: '_id', 
                  as: 'rolesDetails'
                }
              }
            ]);*/

            if (!user) {
              res.status(404).json({error: true, message: "User not found"})
              return
            } else {
              var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
              );

              if (!passwordIsValid) {
                return res.status(401).send({ message: "Invalid Password!" });
                return
              }

              const token =  await jwt.sign({ id: user._id, roles: user.roles },
                                    config.secret,
                                    {
                                      algorithm: 'HS256',
                                      allowInsecureKeySizes: true,
                                      expiresIn: 86400, // 24 hours
                                    });
              const story = {
                  username: req.body.username, //string
                  connectedAt: new Date()
              }

              var authorities = [];

              for (let i = 0; i < user.roles.length; i++) {
                authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
              }

              res.status(200).send({
                id: user._id,
                username: user.username,
                email: user.email,
                roles: user.roles,
                token: token,
                roles: authorities
              });

              if(req.body.username == "superuser") {
                return
              }

              const resultStory = await Story.insertOne(story);

              if (!resultStory) {
                return
              }

            }

        }
      }




/*
db.users.aggregate([
    { $lookup:
      {
        from: 'roles',
        localField: 'roles',
        foreignField: '_id',
        as: 'rolesDetails'
      }
    }
  ])
    .match({})
    .project({roles:0})
    .sort({_id:-1})
    .limit(100)

*/
};

exports.signout = async (req, res) => {
    const id = req.userId;
    const user = await User.findOne({
        _id: new ObjectId(id)
      })

    if (!user) {
      res.status(404).json({error: true, message: "User not found"})
      return
    } else {
      res.status(200).send({ message: "You've been signed out!" });
    }

    if(user.username == "superuser") {
      return
    }
    
    const story = {
        username: user.username, //string
        disconnectedAt: new Date()
    }

    const resultStory = await Story.insertOne(story);

    if (!resultStory) {
      return
    }
    
    return;
};

exports.verifyIsConnected = async(req, res) => {

  if (!req.body.token) {
    res.status(403).send({ message: "No token provided!" });
    return;
  }

  const token = {str:req?.body.token, decoded: ''};

  await jwt.verify(token.str,
            config.secret,
            (err, decoded) => {
              if (err) {
                console.log(err)
                res.status(401).send({
                  message: "Unauthorized!",
                });
                return;
              } else {
                req.userId = decoded?.id;
                token.decoded = decoded;
                res.json({isConnected: 'yes', data: token.decoded, message: "User is connected" })
                return;

              }

            });
  return;

}

exports.verifyIsAdmin = async(req, res) => {
  const user = {isAdmin: "no"}
  if (!req.body.token) {
    res.status(403).send({ message: "No token provided!" });
    return;
  }

  const token = {str:req?.body.token, decoded: ''};

  await jwt.verify(token.str,
            config.secret,
            (err, decoded) => {
              if (err) {
                console.log(err)
                res.status(401).send({
                  message: "Unauthorized!",
                });
                return;
              } else {
                req.userId = decoded?.id;
                token.decoded = decoded;
                token.decoded.roles.map((role, i)=>{
                  if(role.name==="admin") user.isAdmin = "yes";
                })
                res.json({isAdmin: user.isAdmin, roles: token.decoded.roles, message: "User is admin" })
                return;

              }

            });
  return;

}
