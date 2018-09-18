const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load DB models
const ProfileModel = require("../../models/ProfileModel");
const User = require("../../models/User");
const validateProfileInput = require("../../validation/profilevalid");
const validateExperienceInput = require("../../validation/experiencevalid");
const validateEducationInput = require("../../validation/educationvalid");

router.get("/test", (req, res) => res.json({ msg: "Profile Works!" }));

// Get Profile
// Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    ProfileModel.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(400).json(err));
  }
);

// Get all profiles
router.get("/all", (req, res) => {
  const errors = {};

  ProfileModel.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.noprofiles = "There is no profiles";
        return res.status(404).json(errors);
      } else {
        return res.json(profiles);
      }
    })
    .catch(err => res.status(400).json({ profiles: "There is no profiles" }));
});

// Get user profile by handle
router.get("/handle/:handle", (req, res) => {
  const errors = {};

  ProfileModel.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      } else {
        res.json(profile);
      }
    })
    .catch(err => res.status(400).json(err));
});

// Get user profile by ID
router.get("/user/:user_id", (req, res) => {
  const errors = {};

  ProfileModel.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
      } else {
        return res.json(profile);
      }
    })
    .catch(err =>
      res.status(400).json({ profile: "There is no profile for this user" })
    );
});

// Create OR Edit Profile
// Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const profileFields = {};
    profileFields.user = req.user.id;

    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    // Skills - Split into an array
    if (typeof req.body.skills !== "undefined")
      profileFields.skills = req.body.skills.split(",");

    // Social Links
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;

    ProfileModel.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        // Update
        ProfileModel.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        // Create
        // Check for handle first
        ProfileModel.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "Handle already exists!";
            res.status(400).json(errors);
          }

          // Save Profile
          new ProfileModel(profileFields)
            .save()
            .then(profile => res.json(profile));
        });
      }
    });
  }
);

// Add Experience to Profile
// api/profile/experience
// Private route
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    ProfileModel.findOne({ user: req.user.id }).then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to experience array in Profile
      profile.experience.unshift(newExp);
      profile
        .save()
        .then(profile => res.json(profile))
        .catch(err => res.status(400).json(err));
    });
  }
);

// Add profile Education
// api/profile/education
// Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    ProfileModel.findOne({ user: req.user.id }).then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        major: req.body.major,
        from: req.body.from,
        to: req.body.to,
        description: req.body.description
      };

      if (profile.education.length > 0) {
        profile.education = [];
      }
      profile.education.unshift(newEdu);
      profile
        .save()
        .then(profile => res.json(profile))
        .catch(err => res.status(400).json(err));
    });
  }
);

module.exports = router;
