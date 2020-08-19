const mongoose = require('mongoose')
const config = require('config')
const db = config.get('mongoURI')

// connectDB 
const connectDB = async () => {
  try {
    // these params are for avoiding warnings in the terminal console
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    })
    console.log('MongoDB connected...')
  } catch(err) {
    console.error('connection error', err.message)
    // Exit process with failure
    process.exit(1)
  }
}

module.exports = connectDB