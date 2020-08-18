const jwt = require('jsonwebtoken')
const config = require('config')

// middleware
module.exports = function (req, res, next) {
  // get token from http header
  const token = req.header('x-auth-token')
  // const token = req.query["x-auth-token"]
  console.log('middleware token', token);
  // check if no token
  if(!token) {
    return res.status(401).json({ msg: 'No token, no authorisation!'})
  }

  // verify token
  
  try {
    jwt.verify(token, config.get('jwtSecret'), (error, decoded) => {
      if (error) {
        return res.status(401).json({ msg: 'Token is not valid' });
      } else {
        // request obj assign a value to user:
        // the decoded.user as user have it in the payload
        req.user = decoded.user;
        next();
      }
    });
  } catch (err) {
    console.error('something wrong with auth middleware');
    res.status(500).json({ msg: 'Server Error' });
  }
}