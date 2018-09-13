const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

const User = require("../../models/User");

router.get("/test/", (req, res) => res.json({ msg: "Users works" }));

router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      res.status(400).json({ email: "E-Mail already in use" });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //size
        r: "pg", // Rating
        d: "mm" // Default
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar: avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(404).json({ email: "User not found!" });
    } else {
      // Validate Password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (!isMatch) {
          return res.status(400).json({ password: "Invalid Password!" });
        } else {
          // User Matched
          const payload = { id: user.id, name: user.name, avatar: user.avatar };
          // Sign Token
          jwt.sign(
            payload,
            keys.secret,
            { expiresIn: 3600 /*1hr*/ },
            (err, token) => {
              if (err) throw err;
              res.json({
                success: true,
                token: "Bearer " + token
              });
            }
          );
        }
      });
    }
  });
});

// Access Current User
// /api/users/currentuser
// Access: Private! -- Use JWT authentication
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
