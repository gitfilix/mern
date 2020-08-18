const express = require('express')
const router = express.Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator/check')

// get data Model User
const User = require('../../models/User')

// @route   post api/users
// @desc    Register User
// @access  Public

// validation checks express-validator module
router.post('/',[
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email adress').isEmail(),
  check('password', 'Please enter a cooler password then 1234').isLength({min: 6})
],
async (req, res) => {
  console.log('usesr route', req.body)
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  // we are good to go (status 200)
  const { name, email, password } = req.body
  try {
    // 1. see if user exixts - by his email
    let user = await User.findOne({ email })
    // if user already exists... send another 400 to 
    if (user) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'User already exists '}] })
    }

    // 2. get users gravatar
    const avatar = gravatar.url(email, {
      s: '200',
      r: 'pg',
      d: 'mm'
    })

    // 3. creates a new user instance - not saved 
    user = new User({
      name,
      email,
      avatar,
      password
    })

    // 4. encrypt password
    // some hash called salt
    const salt = await bcrypt.genSalt(10)
    
    // take the plaintext password and the salt
    user.password = await bcrypt.hash(password, salt)
    
    // save()method returns a promise so await 
    await user.save()

    // return jsonwebtocken
  
    res.send('User registered')
    
  } catch(err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
  
})

module.exports = router