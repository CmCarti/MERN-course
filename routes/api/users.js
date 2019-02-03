const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

// Load user model
const User = require('../../models/User');

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get("/test", (req, res) => res.json({
  msg: "Testing"
}));

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post('/register', (req, res) => {

  // Look for the email address in the database
  User.findOne({
      email: req.body.email
    })
    .then(user => {
      // If the user exists return an error
      if (user) {
        return res.status(400).json({
          email: "Email already exists"
        });
      } else {

        // Retrieve the avatar from gravatar
        const avatar = gravatar.url(req.body.email, {
          s: '200', // Size
          r: 'pg', // Rating
          d: 'mm' // Default
        });

        // Build the new user with the request body
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar,
          password: req.body.password
        });

        // Generate salt and use it to hash the user password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;

            // Once the password is secured, save the user to the DB
            newUser.save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
          })
        })

      }
    })
})

// @route   POST api/users/login
// @desc    Login User / Returning JWT Token
// @access  Public
router.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Find the user by email
  User.findOne({
      email
    })
    .then(user => {
      // Check for user
      if (!user) {
        return res.status(404).json({
          email: "User not found"
        });
      }

      // Check Password
      bcrypt.compare(password, user.password)
        .then(match => {
          // If the password doesn't match, return an error
          if (!match) {
            return res.status(400).json({
              password: "Password incorrect"
            });
          }
          // Return Token
          res.json({
            msg: "Success"
          });
        })

    });

});

module.exports = router;