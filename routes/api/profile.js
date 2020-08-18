const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

// model Profile and model User
const Profile = require('../../models/Profile')
const User = require('../../models/User')

// @route   GET api/profile/me
// @desc    Get current user profile
// @access  Private as it's detail view '/me'

router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
    'user', 
    ['name', 'avatar']
    )
    
    if(!profile) {
      return res.status(400).json({ msg: 'there is no profile for this user'})
    }
    // respond profile
    res.json(profile)

  } catch(err) {
    console.error(err.message)
    res.status(500).send('Server error profile')
  } 
})

// @route   POST api/profile/me
// @desc    create or update user profile
// @access  Private as it's detail view '/me'

router.post('/', [ auth, [
  check('status', 'status is required').not().isEmpty(),
  check('skills', 'skills are required dude').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const {
    company,
    website,
    location,
    bio, 
    status,
    githubusername,
    skills,
    youtube,
    facebook,
    twitter,
    instagram, 
    linkedin
  } = req.body

  // build profile object 
  const profileFields = {}
  profileFields.user = req.user.id
  if (company) profileFields.company = company
  if (website) profileFields.website = website
  if (location) profileFields.location = location
  if (bio) profileFields.bio = bio
  if (status) profileFields.status = status
  if (githubusername) profileFields.githubusername = githubusername
  if (skills) {
    profileFields.skills = skills.split(',').map(skill => skill.trim())
  }

  // build social-links object
  profileFields.social = {}
  if (youtube) profileFields.social.youtube = youtube
  if (twitter) profileFields.social.twitter = twitter
  if (facebook) profileFields.social.facebook = facebook
  if (linkedin) profileFields.social.linkedin = linkedin
  if (instagram) profileFields.social.instagram = instagram

  try {
    let profile = await Profile.findOne({ user: req.user.id })
    if (profile) {
      // update profile
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true}
      )
      // return profile
      return res.json(profile)
    }
    // profile does not exist, create new
    // create
    profile = new Profile(profileFields)

    await profile.save()
    res.json(profile)

  } catch(err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
  
  res.send('hi there')
})









module.exports = router