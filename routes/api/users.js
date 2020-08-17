const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator/check')


// @route   post api/users
// @desc    Register User
// @access  Public

// validation check express-validator module
router.post('/',[
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email adress').isEmail(),
  check('password', 'Please enter a cooler password then 1234').isLength({min: 6})
] ,(req, res) => {
  console.log('usesr route', req.body)
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  res.send('User route')
})

module.exports = router