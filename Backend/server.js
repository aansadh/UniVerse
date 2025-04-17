const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const cors = require('cors')
require('express-async-handler')
require('dotenv').config()

const authAPI = require('./APIs/authAPI')
const userAPI = require('./APIs/userAPI')
const eventAPI = require('./APIs/eventsAPI')
const friendsAPI = require('./APIs/friendsAPI')
const postAPI = require('./APIs/postAPI')
const PORT = process.env.PORT || 3000

let app = express()

app.use(cors({
    origin: "http://localhost:5173",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.use('/auth', authAPI)
app.use('/users', userAPI)
app.use('/friends', friendsAPI)
app.use('/posts', postAPI)
app.use('/events', eventAPI)

mongoose.connect(process.env.dbURL)
.then(()=>{
    console.log(`Database: ${process.env.dbURL} successfully connected.`)
    app.listen(PORT, ()=>{
        console.log(`Server listening on port: ${PORT}`)
    })
})
.catch((error)=>{
    console.error(`Couldn't connect to the database: ${process.env.database}:: ${error}`)
})

app.use((error, req, res, next)=>{
    res.status(500).send({message: error.message || 'Unexpected Error occurred.', payload: error.stack})
})