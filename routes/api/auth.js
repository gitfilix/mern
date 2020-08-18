const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator')

// User Model (data)
const User = require('../../models/User')

// @route   GET api/auth
// @desc    Test route
// @access  Public

router.get('/', auth, async (req, res) => {
  try {
    // password is excluded
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch(err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

// @route   POST api/auth
// @desc    Authenticate User & get token
// @access  Public

// validation checks express-validator module
router.post('/', [
  check('email', 'Please include a valid email adress').isEmail(),
  check('password', 'Please enter any password').exists()
],
  async (req, res) => {
    console.log('usesr route', req.body)
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    // we want email and password
    const { email, password } = req.body

    try {
      // 1. see if user exixts - by his email
      let user = await User.findOne({ email })
      // if no user found send another 400 to FE
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials ' }] })
      }

      // 2. check password with bcrypt: plaintext-password from user, encrypted password
      const isMatch = await bcrypt.compare(password, user.password)

      if(!isMatch) {
        return res
          .status(400)
          .json({ errors:  [{ msg: 'not correct password' }]})
      }
      // return jsonwebtoken payload
      const payload = {
        user: {
          id: user.id
        }
      }
      // sign the jwt tocken with payload (data), 
      // token-get secret from config, expiration-config, 
      // callback-method error or success
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 3600000 },
        (err, token) => {
          if (err) throw err
          // send token to client 
          res.json({ token })
        })
      //res.send('User registered')

    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server error')
    }
  })


module.exports = router