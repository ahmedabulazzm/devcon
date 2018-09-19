const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

const PostsModel = require("../../models/PostsModel");
const validatePostInput = require("../../validation/postvalid");

router.get("/test", (req, res) => res.json({ msg: "Posts works!" }));

// Create Post
// Private
// routes/api/posts/
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = new PostsModel({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });
    newPost
      .save()
      .then(post => res.json(post))
      .catch(err => res.status(400).json(err));
  }
);

module.exports = router;
