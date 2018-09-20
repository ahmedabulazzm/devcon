const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

const PostsModel = require("../../models/PostsModel");
const validatePostInput = require("../../validation/postvalid");
const ProfileModel = require("../../models/ProfileModel");

router.get("/test", (req, res) => res.json({ msg: "Posts works!" }));

// Get all posts
// Public
router.get("/", (req, res) => {
  PostsModel.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(400).json({ nopostsfound: "No posts found" }));
});

// Get a specific post, find by ID
// Public
router.get("/:id", (req, res) => {
  PostsModel.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ nopostfound: "No post found with that ID" })
    );
});

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

// Delete post
// Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    ProfileModel.findOne({ user: req.user.id }).then(profile => {
      PostsModel.findById(req.params.id)
        .then(post => {
          // Check for post owner
          if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ unauth: "Unauthorized" });
          }

          // Delete
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ nopostfound: "Post not found" }));
    });
  }
);

// Post LIKE route
// api/posts/like/:id <= id is the ID of the post that's being liked
// Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    ProfileModel.findOne({ user: req.user.id }).then(profile => {
      PostsModel.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res.status(400).json({ alreadyliked: "Post already liked" });
          }

          // Add user ID to likes.user
          post.likes.unshift({ user: req.user.id });
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "Post not found" }));
    });
  }
);

// Remove/Delete Like
// Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    ProfileModel.findOne({ user: req.user.id }).then(profile => {
      PostsModel.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res.status(400).json({
              notlikedifp: "Post hasn't been liked in the first place"
            });
          }

          // Get the index to be removed
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          post.likes.splice(removeIndex, 1);
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "Post not found" }));
    });
  }
);

module.exports = router;
