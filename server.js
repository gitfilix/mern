const express = require('express')
const connectDB = require('./config/db')
// const { connections } = require('mongoose')


const app = express()

// connect to DB
connectDB()

app.get('/', (req, res) => res.send('API running'))

const PORT = process.env.PORT || 5000 // local port 5000

app.listen(PORT, () => console.log(`Server started successfully on port ${PORT}`) )