const mongoose = require('mongoose')

let userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 32,
        trim: true
    },
    lastName: {
        type: String,
        maxLength: 32,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
        // pattern matching to be implemented
    },
    password: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        maxLength: 300,
        trim: true
    },
    profilePic: {
        type: String, 
        default: 'Default.svg'
    },
    // lastSeen: ISODate,   
}, {strict: "throw", timestamps: true})

const userModel = mongoose.model('User', userSchema)

module.exports = userModel