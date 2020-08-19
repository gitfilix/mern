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
    res.status(500).send('Server error - get profile me')
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
    res.status(500).send('Server Error - create or update a profile')
  }
  
  res.send('hi there')
})

// @route   GET api/profile
// @desc    get all profiles
// @access  Public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar'])
    res.json(profiles)
  } catch (error) {
    console.error(err.message)
    res.status(500).send('Server error - get profile')
  }
})

// @route   GET api/profile/user/:user_id
// @desc    get profile by user ID
// @access  Public

router.get('/user/:user_id', async (req, res) => {
  try {
    // here we can take the id form req-object
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar'])
    if(!profile) return res.status(400).json({ msg: 'There is no profile for this user id'})
    res.json(profile)
  } catch (error) {
    console.error(err.message)
    if(err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' })
    }
    res.status(500).send('Server error - get user id profile')
  }
})

// @route   DELETE api/profile
// @desc    delete profile, user & posts
// @access  Private (auth)
router.delete('/', auth, async (req, res) => {
  try {
    // TODO remove user posts
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id })
    // Remove User
    await User.findOneAndRemove({ _id: req.user.id })
    
    res.json({ msg: 'User deleted' })
  } catch (error) {
    console.error(err.message)
    res.status(500).send('Server error - remove profile')
  }
})

// @route   PUT api/profile/experience
// @desc    add profile
// @access  Private (auth)

router.put('/experience',
  // checking body data shissle
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'From date is required and needs to be from the past')
        .not()
        .isEmpty()
        .custom((value, { req }) => (req.body.to ? value < req.body.to : true))
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    }

    try {
      // user profile from req.user.id with tocken
      const profile = await Profile.findOne({ user: req.user.id })
      profile.experience.unshift(newExp)

      await profile.save()

      res.json(profile)
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server Error - experiences PUT ')
    }
})

// @route   DELETE api/profile/experience:id
// @desc    remove a experience entry
// @access  Private (auth)

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })
    // get the remove-index
    const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)
    console.log('removeIndex', removeIndex);
    // splicing that experience out of the exp-arry
    profile.experience.splice(removeIndex, 1)

    await profile.save()
    res.json(profile)

  } catch (error) {
    console.error(err.message)
    res.status(500).send('Server Error - experiences DELETE ')
  }
})


module.exports = router