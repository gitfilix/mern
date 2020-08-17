const express = require('express')
const connectDB = require('./config/db')
// const { connections } = require('mongoose')


const app = express()

// connect to DB by using config/db -file
connectDB()

// Init middleware to have a req.body to test
app.use(express.json({ extended: false} ))

app.get('/', (req, res) => res.send('API running'))


// define routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/posts', require('./routes/api/posts'))


const PORT = process.env.PORT || 5000 // local port 5000

app.listen(PORT, () => console.log(`Server started successfully on port ${PORT}`) )